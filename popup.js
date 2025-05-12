document.addEventListener('DOMContentLoaded', async () => {
    const status = document.getElementById('status');
    const loginBtn = document.getElementById('login');
    const scanBtn = document.getElementById('scan');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const blockedInput = document.getElementById('blockedWords');
    const spamListDiv = document.getElementById('spamList');
    const scanStatus = document.getElementById('scanStatus');

    let spamComments = [];
    let selectedCommentIds = new Set();

    chrome.storage.local.get(['blockedWords'], (data) => {
        blockedInput.value = data.blockedWords?.join(', ') || '';
    });

    blockedInput.addEventListener('input', () => {
        const words = blockedInput.value.split(',').map(w => w.trim()).filter(Boolean);
        chrome.storage.local.set({ blockedWords: words });
    });

    scanBtn.onclick = () => {
        scanStatus.textContent = 'Scanning comments...';
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: scrapeComments
            });
        });
    };

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'notify' && msg.message) {
            alert(msg.message);
        }

        if (msg.action === 'reloadTab') {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.reload(tabs[0].id);
            });

            spamListDiv.innerHTML = '';
            spamListDiv.style.display = 'none';
            confirmDeleteBtn.style.display = 'none';
            scanStatus.textContent = 'Spam comments scanned: 0';
        }

        if (msg.action === 'showSpam') {
            spamComments = msg.comments;
            spamListDiv.innerHTML = '';
            spamListDiv.style.display = 'block';
            confirmDeleteBtn.style.display = 'block';
            selectedCommentIds = new Set();

            scanStatus.textContent = `Spam comments scanned: ${spamComments.length}`;

            msg.comments.forEach((comment, i) => {
                const div = document.createElement('div');
                div.innerHTML = `
            <input type="checkbox" id="spam-${i}" checked />
            <label for="spam-${i}">${comment.text}</label>
            `;
                spamListDiv.appendChild(div);
                selectedCommentIds.add(comment.id);
                div.querySelector('input').addEventListener('change', (e) => {
                    if (e.target.checked) {
                        selectedCommentIds.add(comment.id);
                    } else {
                        selectedCommentIds.delete(comment.id);
                    }
                });
            });
        }
    });

    confirmDeleteBtn.onclick = () => {
        const toDelete = spamComments.filter(c => selectedCommentIds.has(c.id));
        if (toDelete.length === 0) {
            alert("No comments selected for deletion.");
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: deleteCommentsById,
                args: [toDelete.map(c => c.id)]
            });
        });
    };
});

function scrapeComments() {
    setTimeout(() => {
        const threads = Array.from(document.querySelectorAll("ytd-comment-thread-renderer"));

        const data = threads.map(thread => {
            const textEl = thread.querySelector("#content-text");
            const anchor = thread.querySelector("a[href*='lc=']");

            const text = textEl?.innerText?.trim() || '';
            let id = null;

            if (anchor) {
                const url = new URL(anchor.href);
                id = url.searchParams.get("lc");
            }

            return { id, text };
        }).filter(comment => comment.id && comment.text);

        chrome.runtime.sendMessage({ action: 'foundComments', comments: data });
    }, 1000);
}

function deleteCommentsById(commentIds) {
    async function deleteCommentById(commentId) {
        const thread = Array.from(document.querySelectorAll("ytd-comment-thread-renderer"))
            .find(t => {
                const anchor = t.querySelector("a[href*='lc=']");
                const id = anchor ? new URL(anchor.href).searchParams.get("lc") : null;
                return id === commentId;
            });

        if (!thread) return;

        const menuButton = thread.querySelector('#action-menu button');
        if (!menuButton) return;
        menuButton.click();

        await new Promise(r => setTimeout(r, 300));

        const menuItems = Array.from(document.querySelectorAll('tp-yt-paper-item'));
        const removeItem = menuItems.find(item => item.innerText.toLowerCase().includes("remove"));
        if (!removeItem) return;
        removeItem.click();

        await new Promise(r => setTimeout(r, 500)); // Wait for dialog to appear

        const confirmBtn = Array.from(document.querySelectorAll('yt-confirm-dialog-renderer button'))
            .find(btn => btn.innerText.toLowerCase().includes("remove"));

        if (confirmBtn) {
            confirmBtn.click();
            console.log("✅ Confirmed comment removal");
        } else {
            console.warn("⚠️ Could not find confirm button");
        }
    }

    (async () => {
        for (const id of commentIds) {
            await deleteCommentById(id);
            await new Promise(r => setTimeout(r, 700)); // small delay between each deletion
        }

        chrome.runtime.sendMessage({ action: 'notify', message: 'Spam comments deleted' });
        chrome.runtime.sendMessage({ action: 'reloadTab' });
    })();
}
