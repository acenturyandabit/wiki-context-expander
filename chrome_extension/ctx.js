chrome.runtime.onInstalled.addListener(function () {
    // When the app gets installed, set up the context menus
    chrome.contextMenus.create({
        title: 'Expand inline from Wikipedia',
        id: "Expand inline from Wikipedia",
        documentUrlPatterns: ["*://en.wikipedia.org/*"],
        contexts: ['selection', 'link']
    });

    function ctxResolve(data,pageurl) {
        chrome.tabs.query({ url:pageurl }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, data);
        });
    }

    chrome.contextMenus.onClicked.addListener(async function (itemData) {
        if (itemData.menuItemId == "Expand inline from Wikipedia") {
            let fetched;
            if (itemData.selectionText) {
                fetched = await fetch("https://en.wikipedia.org/wiki/" + itemData.selectionText);
            } else if (itemData.linkUrl) {
                fetched = await fetch(itemData.linkUrl);
            } else return;
            if (!fetched.ok) {
                ctxResolve({ msg: "There is no wikipedia entry for this!" },itemData.pageUrl);
            } else {
                let pseudo = await fetched.text();
                let fill = document.createElement("div");
                fill.innerHTML = pseudo;
                let mwpo = fill.querySelector(".mw-parser-output");
                for (let i = 0; i < mwpo.children.length; i++) {
                    if (mwpo.children[i].tagName == "P" && mwpo.children[i].innerHTML.includes(".")) {
                        mwpo = mwpo.children[i];
                        break;
                    }
                }
                ctxResolve({ success: mwpo.innerHTML, aurl: itemData.linkUrl },itemData.pageUrl);
            }
        }
    });
});
