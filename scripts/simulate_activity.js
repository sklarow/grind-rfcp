// Function to generate random dates within the last 30 days
// used to test the contribution grid


const getRandomDate = () => {
    const today = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    return date.toISOString();
};

// Function to get random objectives from rfcp.json
const simulateActivity = async () => {
    try {
        // Load objectives
        const response = await fetch('./rfcp.json');
        const data = await response.json();
        const objectives = data.lessons;

        // Get current progress
        const progress = localStorage.getItem('rfcpProgressv2');
        const { completedIds = [], completionDates = {} } = progress ? JSON.parse(progress) : {};

        // Randomly complete 50-80% of objectives
        const totalToComplete = Math.floor(objectives.length * (0.5 + Math.random() * 0.3));
        const shuffled = objectives.sort(() => 0.5 - Math.random());
        const selectedObjectives = shuffled.slice(0, totalToComplete);

        // Assign random dates to selected objectives
        selectedObjectives.forEach(obj => {
            completedIds.push(obj.id);
            completionDates[obj.id] = getRandomDate();
        });

        // Save to localStorage
        localStorage.setItem('rfcpProgressv2', JSON.stringify({ completedIds, completionDates }));
        console.log(`Simulated ${totalToComplete} completions across the last 30 days`);
        
        // Reload the page to see changes
        window.location.reload();
    } catch (error) {
        console.error('Error simulating activity:', error);
    }
};

// Run the simulation
simulateActivity();