// Load RFCP data
const loadObjectives = async () => {
    try {
        const response = await fetch('./rfcp.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.lessons || [];
    } catch (error) {
        console.error('Error loading objectives:', error);
        return [];
    }
};

// Load progress from localStorage
const loadProgress = () => {
    const progress = localStorage.getItem('rfcpProgressv2');
    return progress ? JSON.parse(progress) : { completedIds: [], completionDates: {} };
};

// Save progress to localStorage
const saveProgress = (completedIds, completionDates) => {
    localStorage.setItem('rfcpProgressv2', JSON.stringify({ completedIds, completionDates }));
};

// Update progress display
const updateProgress = (completedIds, totalCount, objectives) => {
    const completedCount = completedIds.length;
    document.getElementById('completed-count').textContent = completedCount;
    document.getElementById('total-count').textContent = totalCount;
    
    const progressBar = document.getElementById('progress');
    const progressPercentage = (completedCount / totalCount) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.textContent = `${Math.round(progressPercentage)}%`;

    // Calculate total time from objectives data
    let totalTime = 0;
    let completedTime = 0;

    objectives.forEach(objective => {
        totalTime += objective.time_min;
        if (completedIds.includes(objective.id)) {
            completedTime += objective.time_min;
        }
    });

    document.querySelector('.preferences p').innerHTML = 
        `<span id="completed-count">${completedCount}</span> / <span id="total-count">${totalCount}</span> completed · 
         <span id="completed-time">${completedTime}</span> / <span id="total-time">${totalTime}</span> minutes`;
};

// Create objective card
const createObjectiveCard = (objective, isCompleted) => {
    const card = document.createElement('div');
    card.className = `objective-card${isCompleted ? ' completed' : ''}`;
    card.dataset.id = objective.id;

    card.innerHTML = `
        <div class="objective-header">
            <div class="type-id-container">
                <span class="objective-type type-${objective.type}">${objective.type}</span>
                <span class="objective-id">${objective.id}</span>
            </div>
            <span class="objective-time">${objective.time_min} min</span>
        </div>
        <h3 class="objective-name">${objective.name}</h3>
        <div class="objective-actions">
            <a href="${objective.url}" class="objective-link" target="_blank">View Details</a>
            <button class="mark-complete-btn">${isCompleted ? 'Completed' : 'Mark as completed'}</button>
        </div>
        <button class="complete-button" aria-label="Toggle completion">
            ✓
        </button>
    `;

    return card;
};

// Filter objectives
const filterObjectives = (objectives, filter = 'all', completedIds = [], searchTerm = '') => {
    // First filter by category
    let filtered = objectives;
    if (filter === 'completed') filtered = objectives.filter(obj => completedIds.includes(obj.id));
    else if (filter === 'unfinished') filtered = objectives.filter(obj => !completedIds.includes(obj.id));
    else if (filter !== 'all') filtered = objectives.filter(obj => obj.type === filter);
    
    // Then filter by search term if provided
    if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(obj => obj.name.toLowerCase().includes(term) || obj.id.toLowerCase().includes(term));
    }
    
    return filtered;
};

// Generate contribution grid for the last 30 days
const generateContributionGrid = (completionDates) => {
    const gridContainer = document.getElementById('contribution-grid');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    // Get dates for the last 30 days
    const today = new Date();
    const dates = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        date.setHours(0, 0, 0, 0);
        dates.push(date);
    }
    
    // Count completions per day
    const completionsPerDay = {};
    
    Object.values(completionDates).forEach(dateString => {
        const date = new Date(dateString);
        date.setHours(0, 0, 0, 0);
        const dateKey = date.toISOString().split('T')[0];
        
        if (completionsPerDay[dateKey]) {
            completionsPerDay[dateKey]++;
        } else {
            completionsPerDay[dateKey] = 1;
        }
    });
    
    // Create grid cells
    dates.forEach(date => {
        const dateKey = date.toISOString().split('T')[0];
        const count = completionsPerDay[dateKey] || 0;
        
        const cell = document.createElement('div');
        cell.className = 'contribution-cell';
        
        // Add level class based on count
        if (count >= 10) {
            cell.classList.add('level-4');
        } else if (count >= 7) {
            cell.classList.add('level-3');
        } else if (count >= 4) {
            cell.classList.add('level-2');
        } else if (count >= 1) {
            cell.classList.add('level-1');
        }
        
        // Add tooltip data
        cell.title = `${date.toLocaleDateString()}: ${count} objectives learned!`;
        
        gridContainer.appendChild(cell);
    });
};

// Initialize app
const initApp = async () => {
    const objectives = await loadObjectives();
    const { completedIds, completionDates } = loadProgress();
    const objectivesList = document.getElementById('objectives-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');
    let currentFilter = 'all';
    let currentSearch = '';

    // Update progress display with objectives data
    updateProgress(completedIds, objectives.length, objectives);
    
    // Generate contribution grid
    generateContributionGrid(completionDates);

    // Render objectives
    const renderObjectives = (filter, search = '') => {
        const filteredObjectives = filterObjectives(objectives, filter, completedIds, search);
        objectivesList.innerHTML = '';
        
        filteredObjectives.forEach(objective => {
            const isCompleted = completedIds.includes(objective.id);
            const card = createObjectiveCard(objective, isCompleted);
            objectivesList.appendChild(card);
        });
    };

    // Handle filter clicks
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderObjectives(currentFilter, currentSearch);
        });
    });

    // Handle search input
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderObjectives(currentFilter, currentSearch);
    });

    // Handle objective clicks
    objectivesList.addEventListener('click', (e) => {
        const card = e.target.closest('.objective-card');
        if (!card || e.target.classList.contains('objective-link')) return;

        const objectiveId = card.dataset.id;
        const index = completedIds.indexOf(objectiveId);

        if (index === -1) {
            completedIds.push(objectiveId);
            completionDates[objectiveId] = new Date().toISOString();
            card.classList.add('completed');
            
            // Trigger confetti effect at the click position
            if (window.confetti) {
                window.confetti.burst(e.clientX, e.clientY);
            }
        } else {
            completedIds.splice(index, 1);
            delete completionDates[objectiveId];
            card.classList.remove('completed');
        }

        saveProgress(completedIds, completionDates);
        updateProgress(completedIds, objectives.length, objectives);
        generateContributionGrid(completionDates); // Update the contribution grid
        renderObjectives(currentFilter); // Re-render with current filter
    });

    // Initial render
    renderObjectives(currentFilter);
};

// Start the app
document.addEventListener('DOMContentLoaded', initApp);