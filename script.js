// Dynamic vote counts stored in localStorage
const POLL_KEY = 'typhoon_mayor_poll_v1';

// Initial structure for new storage
const DEFAULT_DATA = {
    'A': { count: 0, label: '提前全天停課', insight: '安全第一！這反映了大多數學生對於安全防範的高度重視。' },
    'B': { count: 0, label: '正常上班上課', insight: '守護日常！選擇此項的學生通常更看重學習進度的維持。' },
    'C': { count: 0, label: '宣布半天停課', insight: '彈性靈活！這顯示了在安全與運作之間尋求平衡的務實考量。' }
};

// Load or initialize data
let pollData = JSON.parse(localStorage.getItem(POLL_KEY)) || DEFAULT_DATA;

function savePollData() {
    localStorage.setItem(POLL_KEY, JSON.stringify(pollData));
}

function showScreen(screenId) {
    // Hide all cards
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Show the target card
    const target = document.getElementById(screenId);
    target.classList.add('active');
}

function makeDecision(choice) {
    const userChoiceText = document.getElementById('user-choice-text');
    const insightText = document.getElementById('insight-text');
    
    // Increment the count for this choice
    pollData[choice].count++;
    savePollData();
    
    // Set user's choice display
    userChoiceText.textContent = pollData[choice].label;
    insightText.innerHTML = '<span class="loading-dots">正在即時統計高中生填答結果...</span>';
    
    // Animate to results screen
    showScreen('screen-results');
    
    // Reset bars and numbers to 0 explicitly before animation
    resetStats();

    // Trigger progress bar animations with a delay to simulate "calculating"
    setTimeout(() => {
        insightText.textContent = pollData[choice].insight;
        animateStats();
    }, 1500);
}

function resetStats() {
    Object.keys(pollData).forEach(key => {
        const valElement = document.getElementById(`stat-${key.toLowerCase()}-val`);
        const countElement = document.getElementById(`count-${key.toLowerCase()}`);
        const barElement = document.getElementById(`bar-${key.toLowerCase()}`);
        valElement.textContent = '0%';
        countElement.textContent = '(0 票)';
        barElement.style.width = '0%';
    });
}

function animateStats() {
    const totalVotes = Object.values(pollData).reduce((sum, item) => sum + item.count, 0);
    
    // Update percentages and bar widths
    Object.keys(pollData).forEach(key => {
        const data = pollData[key];
        const valElement = document.getElementById(`stat-${key.toLowerCase()}-val`);
        const countElement = document.getElementById(`count-${key.toLowerCase()}`);
        const barElement = document.getElementById(`bar-${key.toLowerCase()}`);
        
        // Calculate percentage (handle division by zero if needed, though totalVotes >= 1 here)
        const targetPercent = totalVotes > 0 ? (data.count / totalVotes) * 100 : 0;
        
        // Counter animation for text
        const duration = 2000;
        const startTime = performance.now();
        
        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            // Animate percentage
            const currentPercent = (easeProgress * targetPercent).toFixed(1);
            valElement.textContent = `${currentPercent}%`;
            
            // Animate vote count
            const currentVotes = Math.floor(easeProgress * data.count);
            countElement.textContent = `(${currentVotes} 票)`;
            
            // Sync bar width
            barElement.style.width = `${easeProgress * targetPercent}%`;
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        }
        
        requestAnimationFrame(updateCount);
    });
}

// Optional: Add simple particle effects for "storm" feel
function createParticles() {
    const container = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.background = 'rgba(255, 255, 255, 0.1)';
        particle.style.width = Math.random() * 2 + 'px';
        particle.style.height = Math.random() * 50 + 50 + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.transform = 'rotate(20deg)';
        particle.style.filter = 'blur(1px)';
        
        // Animation
        const speed = Math.random() * 0.5 + 0.5;
        const duration = 2000 / speed;
        
        particle.animate([
            { transform: `translate(0, -100px) rotate(20deg)`, opacity: 0 },
            { opacity: 0.5, offset: 0.1 },
            { transform: `translate(200px, 1000px) rotate(20deg)`, opacity: 0 }
        ], {
            duration: duration,
            iterations: Infinity,
            delay: Math.random() * 2000
        });
        
        container.appendChild(particle);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
});
