#!/usr/bin/env python3
import sys
import json
import os

def main(path):
    try:
        import pandas as pd
    except Exception as e:
        print(json.dumps({"error":"missing_dependency","message":str(e)}))
        sys.exit(2)

    try:
        xls = pd.read_excel(path, sheet_name=None)
    except Exception as e:
        print(json.dumps({"error":"read_error","message":str(e)}))
        sys.exit(3)

    out = {"file": os.path.basename(path), "sheets": {}}
    for name, df in xls.items():
        header = [str(c) for c in df.columns.tolist()]
        rows, cols = df.shape
        records = df.head(10).where(pd.notnull(df), None).to_dict(orient="records")
        out["sheets"][name] = {
            "rows": int(rows),
            "cols": int(cols),
            "header": header,
            "first_rows": records,
        }

    print(json.dumps(out, ensure_ascii=False))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error":"missing_arg","message":"Usage: summarize_xlsx.py <path-to-xlsx>"}))
        sys.exit(1)
    main(sys.argv[1])
