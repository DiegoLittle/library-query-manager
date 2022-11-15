import { bigquery } from '@google-cloud/bigquery';

// Note: depending on where this code is being run, you may require
// additional authentication. See:
// https://cloud.google.com/bigquery/docs/authentication/
const client = new bigquery.Client();

// https://cloud.google.com/bigquery/docs/reference/libraries

const query_job = client.query(`
SELECT COUNT(*) AS num_downloads
FROM \`bigquery-public-data.pypi.file_downloads\`
WHERE file.project = 'pytest'
  -- Only query the last 30 days of history
  AND DATE(timestamp)
    BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    AND CURRENT_DATE()`);

const results = query_job.result();  // Waits for job to complete.
for (const row of results) {
    console.log(`${row.num_downloads} downloads`);
}