from google.cloud import bigquery

# Note: depending on where this code is being run, you may require
# additional authentication. See:
# https://cloud.google.com/bigquery/docs/authentication/
client = bigquery.Client()

# https://cloud.google.com/bigquery/docs/reference/libraries

query = """
#standardSQL
SELECT a.id, title, answer_count answers, favorite_count favs,
view_count views, score
FROM `bigquery-public-data.stackoverflow.posts_questions` a
where title like '%esprima python%'
LIMIT 10
"""

query_job = client.query(query)
df = query_job.to_dataframe()
df.to_csv('stackoverflow.csv', index=False)


# results = query_job.result()  # Waits for job to complete.
# for row in results:
#     print(row)