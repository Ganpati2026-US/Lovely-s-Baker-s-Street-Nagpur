"""Smart Traffic Management System — illustrative Streamlit dashboard."""

from pathlib import Path

import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(
    page_title="Smart Traffic Management",
    page_icon="🚦",
    layout="wide",
    initial_sidebar_state="expanded",
)

DATA_FILE = Path(__file__).parent / "traffic.csv"
AWS_RESULTS_FILE = Path(__file__).parent / "aws_spark_results.txt"
SPARK_RESULTS_FILE = Path(__file__).parent / "spark_results.txt"
REQUIRED_COLUMNS = {"Location", "Hour", "Vehicle_Type", "Vehicle_Count"}
COLORS = ["#20c4d9", "#4d8dff", "#57e1b2", "#ffba57", "#a58bff"]


def apply_theme() -> None:
    st.markdown(
        """<style>
        .stApp { background: #071526; color: #dbeafe; }
        [data-testid="stSidebar"] { background: #0b2038; border-right: 1px solid #1d3959; }
        [data-testid="stSidebar"] * { color: #dbeafe; }
        .hero { background: linear-gradient(115deg,#0e3156,#0b6f7d); padding: 2rem 2.2rem;
          border-radius: 18px; border: 1px solid #2786a1; margin: .2rem 0 1.5rem; }
        .hero h1 { margin: 0; color: #fff; font-size: 2.2rem; }
        .hero p { margin: .4rem 0 0; color: #bcecf1; font-size: 1.05rem; }
        .metric-card { background: #0c223b; border: 1px solid #1d4569; border-radius: 15px;
          padding: 1.1rem 1.2rem; min-height: 122px; }
        .metric-label { color: #8db6d6; font-size: .84rem; text-transform: uppercase; letter-spacing: .08em; }
        .metric-value { color: #f4fbff; font-size: 1.85rem; font-weight: 700; margin-top: .35rem; }
        .metric-note { color: #58dbc3; font-size: .85rem; margin-top: .2rem; }
        .notice { background: #102b45; border-left: 4px solid #20c4d9; padding: .85rem 1rem;
          border-radius: 6px; color: #c9e6f7; margin: .8rem 0 1.2rem; }
        .section-card { background: #0c223b; border: 1px solid #1d4569; border-radius: 14px;
          padding: 1.1rem 1.3rem; margin-bottom: .8rem; }
        .stDataFrame { border: 1px solid #1d4569; border-radius: 10px; overflow: hidden; }
        </style>""",
        unsafe_allow_html=True,
    )


@st.cache_data(show_spinner=False)
def load_data(path: str) -> tuple[pd.DataFrame | None, str | None]:
    file_path = Path(path)
    if not file_path.exists():
        return None, f"Data file not found: {file_path.name}. Place a valid traffic.csv beside app.py."
    try:
        frame = pd.read_csv(file_path)
    except Exception as exc:
        return None, f"Could not read traffic.csv: {exc}"
    missing = REQUIRED_COLUMNS - set(frame.columns)
    if missing:
        return None, "traffic.csv is missing required column(s): " + ", ".join(sorted(missing))
    frame = frame.copy()
    frame["Hour"] = pd.to_numeric(frame["Hour"], errors="coerce")
    frame["Vehicle_Count"] = pd.to_numeric(frame["Vehicle_Count"], errors="coerce")
    frame = frame.dropna(subset=["Location", "Vehicle_Type", "Hour", "Vehicle_Count"])
    frame = frame[frame["Vehicle_Count"] >= 0]
    if frame.empty:
        return None, "traffic.csv contains no usable traffic records after validation."
    frame["Hour"] = frame["Hour"].astype(int)
    frame["Hour_Label"] = frame["Hour"].map(format_hour)
    return frame, None


def format_hour(hour: int) -> str:
    suffix = "AM" if hour < 12 else "PM"
    display = hour % 12 or 12
    return f"{display} {suffix}"


def chart_layout(fig, title: str):
    fig.update_layout(
        title=title,
        paper_bgcolor="#0c223b",
        plot_bgcolor="#0c223b",
        font=dict(color="#dbeafe", family="Arial"),
        margin=dict(l=20, r=20, t=55, b=20),
        title_font=dict(size=18, color="#f5fbff"),
        legend=dict(bgcolor="rgba(0,0,0,0)"),
    )
    fig.update_xaxes(gridcolor="#1c3b5b", zerolinecolor="#1c3b5b")
    fig.update_yaxes(gridcolor="#1c3b5b", zerolinecolor="#1c3b5b")
    return fig


def metric_card(label: str, value: str, note: str) -> None:
    st.markdown(
        f'<div class="metric-card"><div class="metric-label">{label}</div>'
        f'<div class="metric-value">{value}</div><div class="metric-note">{note}</div></div>',
        unsafe_allow_html=True,
    )


def filtered_data(data: pd.DataFrame) -> pd.DataFrame:
    st.sidebar.subheader("Interactive filters")
    locations = st.sidebar.multiselect("Location", sorted(data["Location"].unique()), default=sorted(data["Location"].unique()))
    hours = st.sidebar.multiselect("Hour", sorted(data["Hour"].unique()), default=sorted(data["Hour"].unique()), format_func=format_hour)
    types = st.sidebar.multiselect("Vehicle type", sorted(data["Vehicle_Type"].unique()), default=sorted(data["Vehicle_Type"].unique()))
    return data[data["Location"].isin(locations) & data["Hour"].isin(hours) & data["Vehicle_Type"].isin(types)].copy()


def show_kpis(data: pd.DataFrame) -> None:
    total = int(data["Vehicle_Count"].sum())
    location_totals = data.groupby("Location", as_index=False)["Vehicle_Count"].sum().sort_values("Vehicle_Count", ascending=False)
    hour_totals = data.groupby(["Hour", "Hour_Label"], as_index=False)["Vehicle_Count"].sum().sort_values("Vehicle_Count", ascending=False)
    type_totals = data.groupby("Vehicle_Type", as_index=False)["Vehicle_Count"].sum().sort_values("Vehicle_Count", ascending=False)
    cols = st.columns(4)
    with cols[0]: metric_card("Total vehicles", f"{total:,}", "Selected sample records")
    with cols[1]: metric_card("Busiest location", str(location_totals.iloc[0]["Location"]).replace("_", " "), f"{int(location_totals.iloc[0]["Vehicle_Count"]):,} vehicles")
    with cols[2]: metric_card("Peak traffic hour", str(hour_totals.iloc[0]["Hour_Label"]), f"{int(hour_totals.iloc[0]["Vehicle_Count"]):,} vehicles")
    with cols[3]: metric_card("Most common vehicle", str(type_totals.iloc[0]["Vehicle_Type"]), f"{int(type_totals.iloc[0]["Vehicle_Count"]):,} vehicles")


def home_page(data: pd.DataFrame) -> None:
    st.markdown('<div class="hero"><h1>🚦 Smart Traffic Management System</h1><p>Big Data Analytics Using Hadoop HDFS, Apache Spark & AWS EC2</p></div>', unsafe_allow_html=True)
    show_kpis(data)
    st.markdown('<div class="notice">This dashboard uses a small illustrative sample of traffic records from Nagpur. It is not live traffic data or a real-time control system.</div>', unsafe_allow_html=True)
    left, right = st.columns([1.15, .85])
    with left:
        st.markdown("### From data to better questions")
        st.write("This project analyzes sample traffic data from major areas of Nagpur to identify volume patterns and support better traffic-management decisions. Spark and HDFS demonstrate the Big Data processing workflow; this responsive dashboard uses Pandas for its interactive view.")
    with right:
        st.markdown("### Dataset snapshot")
        st.write(f"**{len(data)} records**  •  **{data['Location'].nunique()} locations**  •  **{data['Hour'].nunique()} observed hours**")
        st.caption("Use the sidebar to filter the data across the dashboard.")


def analytics_page(data: pd.DataFrame) -> None:
    st.title("Interactive analytics")
    st.caption("All visualizations reflect the current sidebar filters.")
    if data.empty:
        st.warning("No records match the selected filters. Adjust one or more filters to continue.")
        return
    show_kpis(data)
    by_location = data.groupby("Location", as_index=False)["Vehicle_Count"].sum().sort_values("Vehicle_Count", ascending=False)
    by_hour = data.groupby(["Hour", "Hour_Label"], as_index=False)["Vehicle_Count"].sum().sort_values("Hour")
    by_type = data.groupby("Vehicle_Type", as_index=False)["Vehicle_Count"].sum().sort_values("Vehicle_Count", ascending=False)
    c1, c2 = st.columns(2)
    with c1:
        fig = px.bar(by_location, x="Location", y="Vehicle_Count", color="Vehicle_Count", color_continuous_scale=["#17678a", "#20c4d9"], text_auto=True)
        fig.update_layout(coloraxis_showscale=False)
        st.plotly_chart(chart_layout(fig, "Vehicles by location"), use_container_width=True)
    with c2:
        fig = px.line(by_hour, x="Hour_Label", y="Vehicle_Count", markers=True, text="Vehicle_Count", color_discrete_sequence=["#57e1b2"])
        fig.update_traces(textposition="top center", line=dict(width=4))
        st.plotly_chart(chart_layout(fig, "Hourly traffic distribution"), use_container_width=True)
    c3, c4 = st.columns(2)
    with c3:
        fig = px.pie(by_type, names="Vehicle_Type", values="Vehicle_Count", hole=.58, color_discrete_sequence=COLORS)
        fig.update_traces(textinfo="label+percent")
        st.plotly_chart(chart_layout(fig, "Vehicle-type distribution"), use_container_width=True)
    with c4:
        heat = data.pivot_table(index="Location", columns="Hour_Label", values="Vehicle_Count", aggfunc="sum", fill_value=0)
        ordered = [format_hour(h) for h in sorted(data["Hour"].unique())]
        heat = heat.reindex(columns=ordered, fill_value=0)
        fig = px.imshow(heat, text_auto=True, aspect="auto", color_continuous_scale=["#0b2b48", "#20c4d9", "#e4ff74"], labels=dict(x="Hour", y="Location", color="Vehicles"))
        st.plotly_chart(chart_layout(fig, "Location vs hour traffic"), use_container_width=True)
    st.subheader("Detailed traffic records")
    query = st.text_input("Search records", placeholder="Try Manish, Bike, or 9")
    display = data.drop(columns="Hour_Label").sort_values(["Hour", "Location"])
    if query:
        mask = display.astype(str).apply(lambda column: column.str.contains(query, case=False, na=False)).any(axis=1)
        display = display[mask]
    st.dataframe(display, use_container_width=True, hide_index=True)


def insights_page(data: pd.DataFrame) -> None:
    st.title("Congestion insights")
    if data.empty:
        st.warning("No insights are available because the current filters returned no records.")
        return
    loc = data.groupby("Location")["Vehicle_Count"].sum().idxmax()
    loc_count = int(data.groupby("Location")["Vehicle_Count"].sum().max())
    hour = int(data.groupby("Hour")["Vehicle_Count"].sum().idxmax())
    hour_count = int(data.groupby("Hour")["Vehicle_Count"].sum().max())
    vehicle = data.groupby("Vehicle_Type")["Vehicle_Count"].sum().idxmax()
    vehicle_count = int(data.groupby("Vehicle_Type")["Vehicle_Count"].sum().max())
    share = vehicle_count / data["Vehicle_Count"].sum() * 100
    st.markdown("### What the selected sample indicates")
    for title, body in [
        ("Highest observed location", f"**{loc.replace('_', ' ')}** recorded the largest selected volume: **{loc_count:,} vehicles**."),
        ("Busiest observed hour", f"Traffic volume was highest at **{format_hour(hour)}**, with **{hour_count:,} vehicles**."),
        ("Dominant vehicle type", f"**{vehicle}** was the largest category, accounting for **{share:.1f}%** of selected vehicle volume ({vehicle_count:,} vehicles)."),
    ]:
        st.markdown(f'<div class="section-card"><b>{title}</b><br>{body}</div>', unsafe_allow_html=True)
    st.markdown("### Possible traffic-management strategies")
    st.markdown(f"- Review traffic-signal timing near **{loc.replace('_', ' ')}**, particularly around **{format_hour(hour)}**.\n- Consider additional monitoring or manual traffic support during observed peak periods.\n- Prioritize further data collection at high-volume locations before deploying any intervention.\n- Include two-wheeler movement in future planning, since bikes form the largest observed category.")
    st.info("These are planning suggestions derived from a small illustrative dataset, not proven real-world outcomes.")


def architecture_page() -> None:
    st.title("Big Data architecture")
    st.markdown("### Verified workflow")
    st.graphviz_chart('''digraph { graph [bgcolor="transparent", rankdir=LR, nodesep=.5]; node [shape=box, style="rounded,filled", fillcolor="#0c3554", fontcolor="#e9f8ff", color="#20c4d9", margin="0.25,0.15"]; edge [color="#57e1b2", penwidth=2]; csv [label="Sample Traffic CSV"]; hdfs [label="Hadoop HDFS Storage"]; spark [label="Apache Spark Processing"]; analytics [label="Aggregations & Analytics"]; dashboard [label="Interactive Dashboard\n(Pandas + Streamlit)"]; insights [label="Traffic Management Insights"]; csv -> hdfs -> spark -> analytics -> dashboard -> insights; }''')
    st.markdown("### Two verified execution modes")
    left, right = st.columns(2)
    with left:
        st.markdown('<div class="section-card"><b>A. Local MacBook</b><br><br>Hadoop HDFS stores the sample CSV, and the original PySpark script processes data read from HDFS. This is the project’s local Big Data workflow.</div>', unsafe_allow_html=True)
    with right:
        st.markdown('<div class="section-card"><b>B. AWS EC2</b><br><br>Apache Spark was successfully executed on an ARM64 Ubuntu EC2 instance using a local CSV input. AWS HDFS is not claimed or assumed to be configured.</div>', unsafe_allow_html=True)
    st.caption("The dashboard is intentionally Pandas-based for fast, interactive presentation. It does not claim that dashboard calculations are running on Spark.")


def aws_page() -> None:
    st.title("AWS EC2 Spark execution")
    st.markdown("<div class='notice'>The AWS demonstration verifies Apache Spark execution on an Ubuntu 24.04 ARM64 EC2 instance using a local CSV input. It does not represent an AWS HDFS deployment.</div>", unsafe_allow_html=True)
    if AWS_RESULTS_FILE.exists():
        try:
            evidence = AWS_RESULTS_FILE.read_text(encoding="utf-8", errors="replace")
            st.success("Evidence file found: aws_spark_results.txt")
            st.code(evidence, language="text")
        except OSError as exc:
            st.warning(f"AWS evidence file could not be read: {exc}")
    else:
        st.info("aws_spark_results.txt is not present in this workspace. Add the existing evidence file beside app.py to display it here.")
    st.markdown("### Demonstration statement")
    st.write("The AWS run shows the Spark analysis can execute in a cloud virtual-machine environment. For this mini-project, the EC2 input was a local CSV file; configuring HDFS on AWS would be a separate, unverified extension.")


def about_page() -> None:
    st.title("About the project")
    sections = {
        "Problem statement": "Traffic planners need clear summaries of traffic volume patterns. This mini-project demonstrates how a Big Data workflow can transform sample traffic records into accessible analysis.",
        "Objectives": "Store sample data in HDFS, process it using Apache Spark, validate execution on AWS EC2, and communicate results through an interactive dashboard.",
        "Methodology": "A 16-record Nagpur sample CSV is aggregated by location, hour, and vehicle type. The original PySpark script evidences batch processing; this UI loads the CSV with Pandas for fast interactive filtering.",
        "Technologies": "Python, Pandas, Streamlit, Plotly, Hadoop HDFS, Apache Spark / PySpark, and AWS EC2.",
        "Limitations": "The dataset is illustrative, small, and not live. It does not include dates, roadway speeds, incidents, weather, sensor feeds, or outcomes of traffic interventions.",
        "Conclusion": "The project demonstrates an end-to-end, technically honest Big Data analytics workflow and highlights where more robust real-world data would be needed for operational decisions.",
    }
    for heading, text in sections.items():
        st.markdown(f"<div class='section-card'><b>{heading}</b><br><br>{text}</div>", unsafe_allow_html=True)
    if SPARK_RESULTS_FILE.exists():
        st.caption("Local Spark evidence file detected: spark_results.txt")


def main() -> None:
    apply_theme()
    data, error = load_data(str(DATA_FILE))
    st.sidebar.title("🚦 Smart Traffic")
    st.sidebar.caption("Nagpur sample analytics")
    page = st.sidebar.radio("Navigate", ["Home", "Analytics", "Insights", "Architecture", "AWS EC2", "About"])
    if error:
        st.error(error)
        st.stop()
    assert data is not None
    active = filtered_data(data) if page in {"Home", "Analytics", "Insights"} else data
    if page == "Home": home_page(active)
    elif page == "Analytics": analytics_page(active)
    elif page == "Insights": insights_page(active)
    elif page == "Architecture": architecture_page()
    elif page == "AWS EC2": aws_page()
    else: about_page()


if __name__ == "__main__":
    main()
