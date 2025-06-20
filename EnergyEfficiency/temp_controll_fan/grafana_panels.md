## 📌 Motion Sensor Dashboard

**Bucket:** `motion_monit`  
**Measurement:** `motion_status`  
**Field:** `status` (0 = No Motion, 1 = Motion)

### Panels:

| Panel Name                   | Type       | Panel ID | Description                               |
|-----------------------------|------------|----------|-------------------------------------------|
| Current Motion Status       | Stat/Gauge | 1        | Shows "ON" or "OFF" status using custom Flux logic |
| Motion Events Timeline      | Line Chart | 2        | Visualizes ON/OFF motion events across time |
| Light Status Based on Motion| Stat       | 3        | Reflects LED status triggered by motion   |

### 🧠 Flux Query Used

```flux
from(bucket: "motion_monit")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "motion_status" and r._field == "status")
  |> keep(columns: ["_time", "_value"])
  |> map(fn: (r) => ({ r with status: if r._value == 1 then "ON" else "OFF" }))
