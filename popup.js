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

    chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (chrome.runtime.lastError || !token) {
            status.textContent = 'You are not logged in';
            loginBtn.style.display = 'block';
        } else {
            status.textContent = 'You are Logged in';
            loginBtn.style.display = 'none';
        }
    });

    loginBtn.onclick = () => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (token) {
                status.textContent = 'You are Logged in';
                loginBtn.style.display = 'none';
            }
        });
    };

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
        chrome.runtime.sendMessage({ action: 'deleteSelectedSpam', comments: toDelete });
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
