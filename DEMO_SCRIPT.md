# 3-Minute Presentation Script

## 0:00–0:25 — Introduction

“Good morning. Our mini-project is **Smart Traffic Management System using Hadoop HDFS, Apache Spark, Python, and AWS EC2**. The goal is to turn traffic records into clear summaries that can support future traffic-management planning. The dashboard uses a small illustrative sample from Nagpur, so it is not claiming to show live traffic.”

## 0:25–0:55 — Home dashboard

“On the Home page, the four headline values are calculated directly from the CSV. The sample contains 1,825 vehicles. Manish Nagar has the highest volume at 515, 9 AM is the peak observed hour at 650, and bikes are the largest vehicle category at 1,000. These figures change if I change the filters in the sidebar.”

## 0:55–1:35 — Analytics

“The Analytics page makes the patterns easy to explore. The first chart ranks locations by vehicle volume. The hourly chart shows the morning peak. The donut shows the vehicle-type mix, and the heatmap compares every location against every observed hour. I can filter by location, hour, or vehicle type, and the charts, KPI cards, and searchable table all update together. If no data matches, the dashboard explains that clearly.”

## 1:35–2:05 — Insights

“The Insights page converts the selected data into plain-language findings. It highlights the busiest location, peak hour, and dominant vehicle type. It also suggests possible strategies, such as reviewing signal timing and collecting more observations at high-volume points. These are carefully presented as planning suggestions, not proof of real congestion reduction.”

## 2:05–2:35 — Big Data workflow

“The Architecture page shows the processing pipeline: sample CSV, Hadoop HDFS, Apache Spark, aggregations, the interactive dashboard, and then traffic-management insights. On my local MacBook, Spark read the dataset from Hadoop HDFS. The original PySpark script and result files remain separate proof of that processing.”

## 2:35–2:55 — AWS EC2 accuracy

“We also successfully executed the Spark analysis on an AWS EC2 Ubuntu ARM64 instance. The AWS page displays the saved result file. For technical accuracy, that EC2 run read a local CSV file; we do not claim that HDFS was configured on AWS.”

## 2:55–3:00 — Close

“In conclusion, this demonstrates an end-to-end Big Data mini-project with an accessible dashboard, while clearly stating the limitations of the illustrative dataset. Thank you.”
