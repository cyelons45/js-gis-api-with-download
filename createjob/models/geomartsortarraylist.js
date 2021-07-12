/**
* @summary: This method use to sort an array.
* @description: This method sort and remove duplicates from the array of versionID.
*/

'use strict';

/**
 * function to sort the array and remove duplicates
 * @param {Array} Integer array versionID
 * @returns {Array} sorted Integer array versionID   
 */

async function sortArrayList (data) {
    try {
        return [...new Set(data)].sort((a, b) => a - b);
    } catch (error) {
        console.error({
            'Exception occurred while sorting array. ': error.stack
        });
    }
}

// Exports
exports.sortArrayList = sortArrayList;