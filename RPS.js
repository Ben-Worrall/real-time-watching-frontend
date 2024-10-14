const iframe = document.getElementById('sharedIframe');
const ws = new WebSocket('ws://localhost:8080');

// When WebSocket connection is open
ws.onopen = () => {
    console.log('WebSocket connection established');
};

// Listen for messages from WebSocket server
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Update iframe based on received message
    if (data.type === 'scroll') {
        iframe.contentWindow.scrollTo(data.scrollX, data.scrollY);
    }

    if (data.type === 'navigate') {
        iframe.src = data.url;
    }
};

// Function to broadcast scroll position to other users
const broadcastScrollPosition = () => {
    const scrollX = iframe.contentWindow.scrollX;
    const scrollY = iframe.contentWindow.scrollY;
    ws.send(JSON.stringify({ type: 'scroll', scrollX, scrollY }));
};

// Detect scrolling inside the iframe
iframe.onload = () => {
    iframe.contentWindow.addEventListener('scroll', () => {
        broadcastScrollPosition();
    });
};

// Detect iframe navigation and broadcast URL
const broadcastIframeURL = () => {
    const url = iframe.src;
    ws.send(JSON.stringify({ type: 'navigate', url }));
};

// Monitor iframe source changes (navigation)
const observer = new MutationObserver(() => {
    broadcastIframeURL();
});

observer.observe(iframe, { attributes: true, attributeFilter: ['src'] });

ws.onclose = () => {
    console.log('WebSocket connection closed');
};