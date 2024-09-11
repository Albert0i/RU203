function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Create a matrix to store the distances
    const matrix = Array.from({ length: len1 + 1 }, (_, i) => Array.from({ length: len2 + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
    
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, // Deletion
                matrix[i][j - 1] + 1, // Insertion
                matrix[i - 1][j - 1] + cost // Substitution
            );
        }
    }
    
    return matrix[len1][len2];
}

// Test the function
const distance = levenshteinDistance("kitten", "sitting");
console.log(distance); // Output: 3

console.log(levenshteinDistance("The Adolescent", "Fyodor Dostoevsky")); // Output: 15