let spamList = [];

chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg.action === 'foundComments') {
        chrome.storage.local.get(['blockedWords'], async ({ blockedWords }) => {
            spamList = msg.comments.filter(({ text }) => {
                const normalized = text.normalize('NFKD');
                const isWeird = normalized !== text;
                const matched = blockedWords?.some(word => text.toLowerCase().includes(word.toLowerCase()));
                return isWeird || matched;
            });

            chrome.runtime.sendMessage({ action: 'showSpam', comments: spamList });
        });
    }

    if (msg.action === 'deleteSelectedSpam') {
        const selected = msg.comments;
        chrome.identity.getAuthToken({ interactive: true }, async (token) => {
            let failedCount = 0;

            for (const { id } of selected) {
                try {
                    const res = await fetch(`https://www.googleapis.com/youtube/v3/comments?id=${id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (!res.ok) {
                        failedCount++;
                        const errorData = await res.json();
                        console.warn(`❌ Failed to delete ${id}:`, errorData);
                        if (res.status === 403) {
                            chrome.runtime.sendMessage({ action: 'notify', message: `⚠️ You can't delete comment ID ${id}.` });
                        }
                    } else {
                        console.log(`✅ Deleted ${id}`);
                    }
                } catch (err) {
                    console.error(err);
                    failedCount++;
                }
            }

            if (failedCount === 0) {
                chrome.runtime.sendMessage({ action: 'notify', message: '✅ All selected comments deleted successfully!' });
                chrome.runtime.sendMessage({ action: 'reloadTab' });
            } else {
                chrome.runtime.sendMessage({ action: 'notify', message: `⚠️ Some comments couldn’t be deleted. Possibly because you don't own the video.` });
            }
        });
    }
});