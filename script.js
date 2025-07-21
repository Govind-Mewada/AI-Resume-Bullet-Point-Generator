document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt-input');
    const resultsContainer = document.getElementById('results-container');
    const loader = document.getElementById('loader');

    // **IMPORTANT**: Replace "YOUR_API_KEY" with your actual Google AI API key
    const API_KEY = 'AIzaSyAxwA86qC3TtZrf0-LLLCQzS4TVmcBEMhE'; // <-- REVOKE THE OLD KEY AND PASTE YOUR NEW ONE HERE
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    generateBtn.addEventListener('click', generateBulletPoints);

    async function generateBulletPoints() {
        const userInput = promptInput.value.trim();
        if (!userInput) {
            alert('Please enter a description of your work.');
            return;
        }

        // Disable UI and show loader
        generateBtn.disabled = true;
        promptInput.disabled = true;
        loader.style.display = 'block';
        resultsContainer.innerHTML = '';

        try {
            const prompt = `Based on this user input: "${userInput}", generate 3-4 professional and impactful resume bullet points. Each bullet point must start with a strong action verb. Provide the response as a single, valid JSON object with a key "bulletPoints" which is an array of strings. Example: {"bulletPoints": ["Engineered a client-centric platform...", "Spearheaded the development of..."]}. Do not include any other text, explanations, or markdown formatting.`;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.error?.message || `API request failed with status ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!responseText) {
                throw new Error("Received an empty or invalid response from the API.");
            }

            const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(jsonString);

            if (!result.bulletPoints || !Array.isArray(result.bulletPoints)) {
                throw new Error("Invalid data structure in the API response.");
            }

            displayBulletPoints(result.bulletPoints);

        } catch (error) {
            console.error('Error:', error);
            resultsContainer.innerHTML = `<p style="color: red; font-weight: bold;">Error: ${error.message}</p>`;
        } finally {
            loader.style.display = 'none';
            generateBtn.disabled = false;
            promptInput.disabled = false;
        }
    }

    function displayBulletPoints(points) {
        resultsContainer.innerHTML = ''; // Clear previous results
        points.forEach(point => {
            const pointElement = document.createElement('div');
            pointElement.className = 'bullet-point';
            pointElement.textContent = point;

            pointElement.addEventListener('click', () => {
                navigator.clipboard.writeText(point).then(() => {
                    const originalText = pointElement.textContent;
                    pointElement.textContent = 'Copied to clipboard!';
                    pointElement.style.backgroundColor = '#2ecc71'; // Green feedback
                    pointElement.style.color = 'white';
                    setTimeout(() => {
                        pointElement.textContent = originalText;
                        pointElement.style.backgroundColor = ''; // Revert style
                        pointElement.style.color = '';
                    }, 1500);
                });
            });

            resultsContainer.appendChild(pointElement);
        });
    }
});
