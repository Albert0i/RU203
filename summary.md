### Summary to RU203 


#### I. [Querying Structured Data](https://youtu.be/0mqpeQP2sbc)

1. [Finding Exact String Matches](https://youtu.be/cRbPtrGtCsM)

2. Field-Specific Searches

Let's review how to query a `TAG` field in RediSearch. There are two key points:

- Use the @ symbol before the field name
- Surround the search term with curly braces

For example, here's how we query the books index (called books-idx) for a specific ISBN value:
```
FT.SEARCH books-idx "@isbn:{9780393059168}"
```

This is an example of searching one field. When we talk about boolean logic and later about full-text search, you'll see examples of searching across multiple fields.

3. Escaping Punctuation

**A note on querying with punctuation:** To query for a tag that includes punctuation, like an email address, you need to escape the punctuation (the data in the underlying Hash does not need to be escaped). For example, if we had a tag for "j. r. r. tolkien" instead of author ID, to query it you would need to write **@authors:{j\\. r\\. r\\. tolkien}**.

As you can see, you escape punctuation by preceding it with two backslashes (\\).

So, as a general rule you, should always escape the following punctuation in TAG field queries:

,.<>{}[]"':;!@#$%^&*()-+=~

4. [Working with Numbers](https://youtu.be/grBk0_iz-BM)

Try finding the titles of books with an average rating from 4.5 through 5:
```
FT.SEARCH books-idx "@average_rating:[4.5 5]" RETURN 1 title
```

Now find the titles of books with an average rating from 0 through 1:
```
FT.SEARCH books-idx "@average_rating:[0 1]" RETURN 1 title
```

Next, find the titles of books having an average rating of at least 4 and being published on or after 2015:
```
FT.SEARCH books-idx "@average_rating:[4 +inf] @published_year:[2015 +inf]" RETURN 1 title
```

Finally, find the titles of books with an average rating of at most 3 published before 2000:
```
FT.SEARCH books-idx "@average_rating:[-inf 3] @published_year:[-inf (2000]" RETURN 1 title
```

5. [Working with Dates and Times](https://youtu.be/TuWdvZNEsmI)

Try finding users who have logged in on or after 1:25pm UTC on December 11, 2020:
```
FT.SEARCH users-idx "@last_login:[1607693100 +inf]"
```

Now try to find users whose last login was prior to 1:25pm UTC on December 11, 2020:
```
FT.SEARCH users-idx "@last_login:[-inf (1607693100]"
```

You'll have to use a tool like the [UnixTimestampConverter](http://www.unixtimestampconverter.com/) to get the correct timestamp.

6. [Boolean Logic](https://youtu.be/lH8m4bBVg-k)

7. Full-Text Search

Many of the queries in this section use full-text search because this type of query makes boolean logic simple to illustrate.

Queries that don’t use a specific field default to full-text search using all TEXT fields. So, consider again the following query, taken from the last video:
```
FT.SEARCH books-idx "dogs|cats"
```

This query searches for dogs OR cats in all TEXT fields in the index.

For now, don’t worry about exactly how full-text search works. Focus on the boolean logic, and we’ll tell you all about full-text search in the next section.

8. Combining Multiple Fields

You can also use boolean logic to combine terms from multiple fields.

Here, we use a boolean AND to find books with the author “rowling” that have “goblet” in the title.
```
FT.SEARCH books-idx "@authors:rowling @title:goblet"
```

Just like when you use a boolean OR for terms in a single field, you connect two fields with a boolean OR by joining them with a pipe. In this query, we find books by the author “rowling” or that have “potter” in the title.
```
FT.SEARCH books-idx "@authors:rowling | @title:potter"
```

And same as with searching for terms in a field, use the dash symbol for a NOT query between fields. In this query, I'm looking for books by Tolkien whose titles do not include the word "ring".
```
FT.SEARCH books-idx "@authors:tolkien -@title:ring"
```

Try getting Stephen King books published between 1980 and 1990, inclusive.
```
FT.SEARCH books-idx "@authors:'Stephen King' @published_year:[1980 1990]"
```

Now try finding books with the Philosophy category, published on or before 1975, written by anyone other than Arthur Koestler.
```
FT.SEARCH books-idx "@categories:{Philosophy} @published_year:[-inf 1975] -@authors:'Arthur Koestler'"
```

Note: We use curly braces around “Philosophy” in this query because “categories” is a TAG field. As you may recall from our section on exact-string matches, querying TAG fields requires curly braces.

Finally, try finding books written by Aruthur Koestler OR Michel Foucault:
```
FT.SEARCH books-idx "@authors:'Arthur Koestler' | @authors:'Michel Foucault'"
```

9. [Sorting Results](https://youtu.be/UpCUKPbCn3U)

10. Descending Sort

Here's the same query from the video you just watched, but this time with results sorted in descending order:
```
FT.SEARCH books-idx "@published_year:[2018 +inf]" SORTBY published_year DESC
```

11. Sorting by Multiple Fields

The SORTBY option to FT.SEARCH allows you to sort by only one field per query. However, as you’ll see when we talk about aggregations, you can sort an aggregation query by more than one field.

Try finding Juvenile Fiction books sorted by the year they were published:
```
FT.SEARCH books-idx "@categories:{Juvenile Fiction}" SORTBY published_year
```

Now try finding books with an average rating between 4.9 and 5 inclusive, sorted by average rating in descending order:
```
FT.SEARCH books-idx "@average_rating:[4.9 5]" SORTBY average_rating DESC
```

12. [Limiting Results](https://youtu.be/pK5uWyqgcAo)

13. Pagination

You can use LIMIT for pagination. To get the first five Agatha Christie books ordered by publication date, you might write this:
```
FT.SEARCH books-idx "@authors:Agatha Christie" SORTBY published_year LIMIT 0 5
```

And to get the next five Agatha Christie books, you could write this:
```
FT.SEARCH books-idx "@authors:Agatha Christie" SORTBY published_year LIMIT 5 5
```

Try searching for books written by Ursula K. Le Guin, ordered by publication year, and limiting the query to the first 3 books published.
```
FT.SEARCH books-idx "@authors:Ursula K. Le Guin" SORTBY "published_year" LIMIT 0 3
```

Next, try some offset and limit pagination. Starting at offset 100, get the next 100 books from the Fiction category published on or after the year 2000.
```
FT.SEARCH books-idx "@published_year:[2000 +inf]" LIMIT 100 100
```


#### II. [Full-Text Search](https://youtu.be/be10fjWAsUg)

1. [Basic Full-Text Search](https://youtu.be/5XLvPmVVH4E)

2. Stemming

When you index a field as TEXT, RediSearch stores the root of the word in the index, not the word itself. So the word “thinking” becomes “think,” “running” becomes “run,” and so on. This is known as stemming.

Here’s an example of how this works. I search for books that have the word “running” in the title.
```
FT.SEARCH books-idx "@title:running" RETURN 1 title
```

And I get back books with the words “Running” and “Run” in the title.
```
127.0.0.1:6379> FT.SEARCH books-idx "@title:running" RETURN 1 title
 1) (integer) 14
 2) "ru203:book:details:9780679722946"
 3) 1) "title"
    2) "Running Dog"
 4) "ru203:book:details:9780451197962"
 5) 1) "title"
    2) "The Running Man"
 6) "ru203:book:details:9780385315289"
 7) 1) "title"
    2) "Running from Safety"
 8) "ru203:book:details:9780345461612"
 9) 1) "title"
    2) "Running from the Deity"
10) "ru203:book:details:9780330281720"
11) 1) "title"
    2) "Running in the Family"
12) "ru203:book:details:9781400033829"
13) 1) "title"
    2) "Who Will Run the Frog Hospital?"
14) "ru203:book:details:9780590317672"
15) 1) "title"
    2) "Run"
16) "ru203:book:details:9780439650366"
```

Full-text search works by comparing terms in the input against all TEXT fields in the index. Try searching for books using the name of a popular author of spy novels, John Le Carre.
```
FT.SEARCH books-idx "John Le Carre"
```

Queries also compare your terms against descriptions. Try searching for unicorns with this query:
```
FT.SEARCH books-idx unicorns
```

Notice that the results have “unicorn” in their descriptions.

3. [Prefix Matching](https://youtu.be/OHUbm0_3yIg)

You can combine a normal full-text term with a prefix term. Try searching for matches with the term “atwood” and the prefix “hand”:
```
FT.SEARCH books-idx "atwood hand*"
```

You can also use multiple prefix terms in a single query. Try searching for “agat* orie*” -- you should find Murder on the Orient Express.
```
FT.SEARCH books-idx "agat* orie*"
```

4. [Boolean logic, field-specific searches, sorting, and limiting](https://youtu.be/NTGGBQnOqVY)

Try finding books about dragons that are not also about wizards or magicians!
```
FT.SEARCH books-idx "dragons -wizard -magician"
```

Now, try a full-text search for “mars” across all TEXT fields with a full-text search for “heinlein” in only the authors field:
```
FT.SEARCH books-idx "mars @authors:heinlein"
```

Try sorting all books that mention the prefix “crypto” sorted by publication year.
```
FT.SEARCH books-idx crypto* sortby published_year
```

Finally, get the first book in order of publication year that mentions “murder”:
```
FT.SEARCH books-idx murder sortby published_year limit 0 1
```

5. [Highlighting and Summarization](https://youtu.be/6M_2QD1jEwI)

6. Summarization

Summarizing refers to the practice of returning small snippets of text around terms that matched a query, rather than the entire field.

This query returns a maximum of three (which is also the default) "fragments" of twenty-five words each for matches of the term "agamemnon":
```
FT.SEARCH books-idx agamemnon SUMMARIZE FIELDS 1 description FRAGS 3 LEN 25
```

**Note**: In this context, the matching text is often called a “hit.”

Result:
```
1) (integer) 6
 2) "ru203:book:details:9780812216271"
 3)  1) "description"
     2) "David Slavitt of the great trilogy of the House of Atreus, telling of
         Agamemnon's murder at the hands of his wife, Clytemnestra, and her 
         lover... "
     3) "categories"
     4) "Drama"
     5) "thumbnail"
     6) "http://books.google.com/books/content?id=z22kI-IKUXoC&printsec=
         frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
     7) "subtitle"
     8) "The Oresteia (Agamemnon, The Libation Bearers, The Eumenides)"
     9) "title"
    10) "Aeschylus, 1"
    11) "isbn"
    12) "9780812216271"
    13) "average_rating"
    14) "4.01"
    15) "authors"
    16) "Aeschylus"
    17) "published_year"
    18) "1998"
    19) "author_ids"
    20) "538"
...
```

You can combine **HIGHLIGHT** and **SUMMARIZE** together to highlight hits in a field and summarize the text returned around each hit.
```
FT.SEARCH books-idx agamemnon SUMMARIZE FIELDS 1 description FRAGS 3 LEN 25 HIGHLIGHT
```

Result:
```
 1) (integer) 6
 2) "ru203:book:details:9780812216271"
 3)  1) "description"
     2) "David Slavitt of the great trilogy of the House of Atreus, telling of
        <b>Agamemnon</b>'s murder at the hands of his wife, Clytemnestra, and 
        her lover... "
     3) "categories"
     4) "Drama"
     5) "thumbnail"
     6) "http://books.google.com/books/content?id=z22kI-IKUXoC&
        printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
     7) "subtitle"
     8) "The Oresteia (Agamemnon, The Libation Bearers, The Eumenides)"
     9) "title"
    10) "Aeschylus, 1"
    11) "isbn"
    12) "9780812216271"
    13) "average_rating"
    14) "4.01"
    15) "authors"
    16) "Aeschylus"
    17) "published_year"
    18) "1998"
    19) "author_ids"
    20) "538"
...
```

Search for the term “illusion” and highlight any matches:
```
FT.SEARCH books-idx illusion highlight
```

Now search for “shield,” highlighting any matches, and summarizing the description field with a max fragments of 1 and length 20.
```
FT.SEARCH books-idx shield HIGHLIGHT SUMMARIZE FIELDS 1 description FRAGS 1 LEN 20
```


#### III. [Aggregations](https://youtu.be/P9xU4RKE0vg)


#### IV. Advanced Topics


### EOF (2024/09/XX) 
