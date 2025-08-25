// Global state
let currentInputMethod = 'url';
let currentTone = 'neutral';

// DOM Elements
const urlToggle = document.getElementById('url-toggle');
const textToggle = document.getElementById('text-toggle');
const urlSection = document.getElementById('url-section');
const textSection = document.getElementById('text-section');
const urlInput = document.getElementById('url-input');
const textInput = document.getElementById('text-input');
const validateUrl = document.getElementById('validate-url');
const charCount = document.getElementById('char-count');
const analyzeBtn = document.getElementById('analyze-btn');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const errorMessage = document.getElementById('error-message');
const loadingCard = document.getElementById('loading-card');
const summaryCard = document.getElementById('summary-card');
const biasCard = document.getElementById('bias-card');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateCharCount();
});

function setupEventListeners() {
    // Input method toggle
    urlToggle.addEventListener('click', () => switchInputMethod('url'));
    textToggle.addEventListener('click', () => switchInputMethod('text'));
    
    // Tone selection
    document.querySelectorAll('.tone-btn').forEach(btn => {
        btn.addEventListener('click', () => selectTone(btn.dataset.tone));
    });
    
    // Text input character count
    textInput.addEventListener('input', updateCharCount);
    
    // Validate URL
    validateUrl.addEventListener('click', handleUrlValidation);
    
    // Analyze button
    analyzeBtn.addEventListener('click', handleAnalyze);
    
    // Copy and share buttons
    document.getElementById('copy-summary').addEventListener('click', copySummary);
    document.getElementById('share-summary').addEventListener('click', shareSummary);
}

function switchInputMethod(method) {
    currentInputMethod = method;
    
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    if (method === 'url') {
        urlToggle.classList.add('active');
        urlSection.classList.remove('hidden');
        textSection.classList.add('hidden');
    } else {
        textToggle.classList.add('active');
        urlSection.classList.add('hidden');
        textSection.classList.remove('hidden');
    }
}

function selectTone(tone) {
    currentTone = tone;
    
    // Update tone buttons
    document.querySelectorAll('.tone-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tone="${tone}"]`).classList.add('active');
}

function updateCharCount() {
    const count = textInput.value.length;
    charCount.textContent = `${count} characters`;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

function setLoading(isLoading) {
    if (isLoading) {
        btnText.classList.add('hidden');
        btnSpinner.classList.remove('hidden');
        analyzeBtn.disabled = true;
        loadingCard.classList.remove('hidden');
        summaryCard.classList.add('hidden');
        biasCard.classList.add('hidden');
    } else {
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
        analyzeBtn.disabled = false;
        loadingCard.classList.add('hidden');
    }
}

async function handleUrlValidation() {
    const url = urlInput.value.trim();
    if (!url) {
        showError('Please enter a URL first');
        return;
    }

    try {
        validateUrl.innerHTML = '⏳';
        const response = await fetch('/api/validate-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();
        
        if (data.valid) {
            validateUrl.innerHTML = '✅';
            showNotification('URL validated successfully!', 'success');
        } else {
            validateUrl.innerHTML = '❌';
            showError(data.message || 'Invalid URL');
        }
    } catch (error) {
        validateUrl.innerHTML = '❌';
        showError('Failed to validate URL: ' + error.message);
    }

    setTimeout(() => {
        validateUrl.innerHTML = '✓';
    }, 2000);
}

async function handleAnalyze() {
    // Validate input
    let content = '';
    let url = '';
    
    if (currentInputMethod === 'url') {
        url = urlInput.value.trim();
        if (!url) {
            showError('Please enter a URL');
            return;
        }
        content = 'URL_PLACEHOLDER'; // Server will extract content
    } else {
        content = textInput.value.trim();
        if (content.length < 100) {
            showError('Article content must be at least 100 characters');
            return;
        }
    }

    try {
        setLoading(true);
        
        const requestBody = {
            content,
            tone: currentTone
        };
        
        if (currentInputMethod === 'url') {
            requestBody.url = url;
        }

        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            let errorMessage = 'Analysis failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // If we can't parse JSON, use a generic message
                if (response.status === 0 || !response.status) {
                    errorMessage = 'Cannot connect to server. Please check if the server is running.';
                } else {
                    errorMessage = `Server error (${response.status}). Please try again.`;
                }
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        displayResults(data);
        
    } catch (error) {
        console.error('Analysis error:', error);
        showError('Analysis failed: ' + error.message);
    } finally {
        setLoading(false);
    }
}

function displayResults(data) {
    console.log('Displaying results:', data);
    
    // Display summary
    displaySummary(data);
    
    // Display bias analysis
    if (data.biasAnalysis) {
        console.log('Displaying bias analysis:', data.biasAnalysis);
        displayBiasAnalysis(data.biasAnalysis);
        biasCard.classList.remove('hidden');
    } else {
        console.error('No bias analysis data received');
    }
    
    // Show result cards
    summaryCard.classList.remove('hidden');
    
    // Scroll to results
    summaryCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displaySummary(data) {
    const toneBadge = document.getElementById('tone-badge');
    const summaryContent = document.getElementById('summary-content');
    const readingTime = document.getElementById('reading-time');
    
    // Update tone badge
    const toneLabels = {
        'neutral': 'Neutral Tone',
        'facts': 'Facts Only',
        'simple': 'Simple Language'
    };
    toneBadge.textContent = toneLabels[currentTone] || 'Neutral Tone';
    
    // Update summary content
    summaryContent.textContent = data.summary;
    
    // Update reading time
    readingTime.textContent = data.readingTime || '2 min read';
}

function displayBiasAnalysis(biasData) {
    console.log('displayBiasAnalysis called with:', biasData);
    
    const biasLevel = document.getElementById('bias-level');
    const biasProgress = document.getElementById('bias-progress');
    const biasIndicators = document.getElementById('bias-indicators');
    const recList = document.getElementById('rec-list');
    
    if (!biasData) {
        console.error('No bias data provided to displayBiasAnalysis');
        return;
    }
    
    // Update overall bias level
    if (biasLevel && biasData.level) {
        biasLevel.textContent = biasData.level;
        biasLevel.className = 'bias-level ' + biasData.level.toLowerCase().replace(' ', '-');
    }
    
    // Update progress bar
    if (biasProgress && biasData.overallScore !== undefined) {
        biasProgress.style.width = `${biasData.overallScore}%`;
    }
    
    // Update indicators
    if (biasIndicators && biasData.indicators) {
        biasIndicators.innerHTML = '';
        const indicators = [
            { key: 'languageTone', icon: '🗣️', title: 'Language Tone' },
            { key: 'sourceDiversity', icon: '📰', title: 'Source Diversity' },
            { key: 'factVerification', icon: '✅', title: 'Fact Verification' }
        ];
        
        indicators.forEach(({ key, icon, title }) => {
            const indicator = biasData.indicators[key];
            if (indicator) {
                const indicatorEl = createIndicator(icon, title, indicator);
                biasIndicators.appendChild(indicatorEl);
            }
        });
    }
    
    // Update recommendations
    if (recList && biasData.recommendations && Array.isArray(biasData.recommendations)) {
        recList.innerHTML = '';
        biasData.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recList.appendChild(li);
        });
    } else {
        console.warn('No recommendations found or recList element missing');
    }
    
    console.log('Bias analysis display completed');
}

function createIndicator(icon, title, data) {
    const div = document.createElement('div');
    div.className = `indicator ${data.status.toLowerCase()}`;
    
    div.innerHTML = `
        <div class="indicator-icon">${icon}</div>
        <div class="indicator-content">
            <h6>${title}</h6>
            <p>${data.description}</p>
        </div>
        <div class="indicator-status">${data.status}</div>
    `;
    
    return div;
}

function copySummary() {
    const summaryContent = document.getElementById('summary-content');
    navigator.clipboard.writeText(summaryContent.textContent).then(() => {
        showNotification('Summary copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy summary', 'error');
    });
}

function shareSummary() {
    const summaryContent = document.getElementById('summary-content');
    if (navigator.share) {
        navigator.share({
            title: 'NewsLens Analysis',
            text: summaryContent.textContent,
            url: window.location.href
        });
    } else {
        copySummary();
    }
}

function showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}