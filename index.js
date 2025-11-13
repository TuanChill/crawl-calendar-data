const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Crawl calendar data from VietnamNet API
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2024)
 * @returns {Promise<Object>} - Calendar data
 */
async function crawlCalendarData(month, year) {
    const url = 'https://vietnamnet.vn/newsapi/Calendar/searchCalendarList';
    
    const headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'vi,en-US;q=0.9,en;q=0.8',
        'content-type': 'application/json',
        'origin': 'https://vietnamnet.vn',
        'referer': 'https://vietnamnet.vn/lich-van-nien',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
    };

    const data = {
        Month: month,
        Year: year
    };

    try {
        console.log(`Crawling data for ${month}/${year}...`);
        const response = await axios.post(url, data, { headers });
        
        if (response.data && response.data.status) {
            console.log(`✓ Successfully crawled ${month}/${year}`);
            return response.data;
        } else {
            console.error(`✗ Failed to crawl ${month}/${year}: Invalid response`);
            return null;
        }
    } catch (error) {
        console.error(`✗ Error crawling ${month}/${year}:`, error.message);
        return null;
    }
}

/**
 * Crawl calendar data for multiple years
 * @param {number[]} years - Array of years to crawl
 * @returns {Promise<Object>} - All calendar data organized by year
 */
async function crawlMultipleYears(years) {
    const allData = {};
    
    for (const year of years) {
        console.log(`\n=== Crawling year ${year} ===`);
        allData[year] = {};
        
        for (let month = 1; month <= 12; month++) {
            const monthData = await crawlCalendarData(month, year);
            
            if (monthData) {
                allData[year][month] = monthData;
            }
            
            // Add a small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log(`✓ Completed year ${year}`);
    }
    
    return allData;
}

/**
 * Save crawled data to JSON file
 * @param {Object} data - Data to save
 * @param {string} filename - Output filename
 */
function saveToFile(data, filename = 'calendar_data.json') {
    try {
        const outputPath = path.join(__dirname, filename);
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`\n✓ Data saved to ${outputPath}`);
    } catch (error) {
        console.error('✗ Error saving file:', error.message);
    }
}

/**
 * Main function to crawl calendar data for years 2024-2027
 */
async function main() {
    const years = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029];
    
    console.log('Starting calendar data crawl...');
    console.log(`Years to crawl: ${years.join(', ')}`);
    console.log(`Total months: ${years.length * 12}`);
    
    const startTime = Date.now();
    
    // Crawl data for all years
    const allData = await crawlMultipleYears(years);
    
    // Save to file
    saveToFile(allData);
    
    // Save each year separately (optional)
    for (const year of years) {
        saveToFile(allData[year], `calendar_${year}.json`);
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n✓ Crawl completed in ${duration} seconds`);
}

// Run the main function
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

// Export functions for use as module
module.exports = {
    crawlCalendarData,
    crawlMultipleYears,
    saveToFile
};
