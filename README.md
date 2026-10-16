# Smart Traffic Management System

A university mini-project dashboard for an illustrative Nagpur traffic dataset. It presents a technically distinct workflow: the original project uses Hadoop HDFS and PySpark for batch processing, while this Streamlit interface uses Pandas for fast, interactive exploration.

## Run

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

Or run `./start_demo.sh`.

Then open the local address Streamlit prints (usually `http://localhost:8501`).

## Included pages

- **Home** — dynamically calculated KPIs.
- **Analytics** — filters, Plotly charts, heatmap, and searchable records.
- **Insights** — data-derived observations and cautious planning recommendations.
- **Architecture** — the CSV → HDFS → Spark → dashboard workflow, plus an accurate distinction between local HDFS/Spark and EC2 local-CSV Spark execution.
- **AWS EC2** — displays `aws_spark_results.txt` when available.
- **About** — academic project context, methods, technologies, and limits.

## Data notes

`traffic.csv` contains 16 illustrative sample records, not live traffic readings. All displayed calculations are derived from that file. The app validates missing files, required columns, invalid numeric values, and empty filter results.

## Preserve the Spark artifacts

Place existing `traffic_analysis.py`, `spark_results.txt`, and `aws_spark_results.txt` beside `app.py` if they are not already present. The dashboard never edits or runs those files; they remain evidence of the separate Spark workflow.
