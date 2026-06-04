"""Thin ATS polling layer.

Each normaliser returns a list of dicts with keys:
    ext      – the ATS-native job ID
    title    – job title
    location – location string (may be empty)
    url      – link to apply
    department – team/department (optional)
    posted   – ISO datetime string (optional)

fetch() wraps them with company metadata.
"""
from __future__ import annotations
import re
import xml.etree.ElementTree as ET

import requests

SESSION = requests.Session()
SESSION.headers["User-Agent"] = "role-monitor/1.0"


def _get(url, **kw):
    return SESSION.get(url, timeout=15, **kw)


# ---------------------------------------------------------------------------
# Normalisers
# ---------------------------------------------------------------------------

def _greenhouse(token, data):
    out = []
    for j in data.get("jobs", []):
        locs = ", ".join(o.get("name", "") for o in j.get("offices", [])) or \
               ", ".join(l.get("name", "") for l in j.get("location", {}).get("name", "").split(",") if l) or \
               j.get("location", {}).get("name", "")
        out.append(dict(
            ext=str(j["id"]),
            title=j.get("title", ""),
            location=locs,
            url=j.get("absolute_url", ""),
            department=", ".join(d.get("name", "") for d in j.get("departments", [])),
            posted=j.get("updated_at", ""),
        ))
    return out


def _lever(token, data):
    out = []
    for j in data if isinstance(data, list) else []:
        cats = j.get("categories", {})
        out.append(dict(
            ext=j["id"],
            title=j.get("text", ""),
            location=cats.get("location", ""),
            url=j.get("hostedUrl", ""),
            department=cats.get("team", ""),
            posted=j.get("createdAt", ""),
        ))
    return out


def _ashby(token, data):
    out = []
    for j in data.get("jobs", []):
        loc = ""
        for l in j.get("jobLocations", []):
            loc = l.get("locationName", l.get("city", ""))
            break
        out.append(dict(
            ext=j["id"],
            title=j.get("title", ""),
            location=loc,
            url=j.get("jobUrl", ""),
            department=j.get("departmentName", ""),
            posted=j.get("publishedDate", ""),
        ))
    return out


def _smartrecruiters(token, data):
    out = []
    for j in data.get("content", []):
        loc = j.get("location", {})
        loc_str = ", ".join(filter(None, [loc.get("city"), loc.get("country")]))
        out.append(dict(
            ext=j["id"],
            title=j.get("name", ""),
            location=loc_str,
            url=f"https://jobs.smartrecruiters.com/{token}/{j['id']}",
            department=j.get("department", {}).get("label", ""),
            posted=j.get("releasedDate", ""),
        ))
    return out


def _workable(token, data):
    out = []
    for j in data.get("jobs", []):
        out.append(dict(
            ext=j.get("shortcode", j.get("id", "")),
            title=j.get("title", ""),
            location=j.get("location", {}).get("city", ""),
            url=j.get("url", ""),
            department=j.get("department", ""),
            posted=j.get("created_at", ""),
        ))
    return out


def _recruitee(token, data):
    out = []
    for j in data.get("offers", []):
        out.append(dict(
            ext=str(j["id"]),
            title=j.get("title", ""),
            location=j.get("location", ""),
            url=j.get("careers_url", ""),
            department=j.get("department", ""),
            posted=j.get("published_at", ""),
        ))
    return out


def _personio(token, text):
    out = []
    try:
        root = ET.fromstring(text)
        for pos in root.findall(".//position"):
            def t(tag):
                el = pos.find(tag)
                return el.text.strip() if el is not None and el.text else ""
            out.append(dict(
                ext=t("id") or t("jobId"),
                title=t("name"),
                location=t("office"),
                url=t("jobDescriptions/jobDescription/URL") or t("occupationCode"),
                department=t("department"),
                posted=t("createdAt"),
            ))
    except ET.ParseError:
        pass
    return out


ENDPOINTS = {
    "greenhouse": "https://boards-api.greenhouse.io/v1/boards/{t}/jobs?content=true",
    "lever": "https://api.lever.co/v0/postings/{t}?mode=json",
    "ashby": "https://api.ashbyhq.com/posting-api/job-board/{t}",
    "smartrecruiters": "https://api.smartrecruiters.com/v1/companies/{t}/postings?status=PUBLISHED&limit=100",
    "workable": "https://apply.workable.com/api/v3/accounts/{t}/jobs",
    "recruitee": "https://{t}.recruitee.com/api/offers",
    "personio": "https://{t}.jobs.personio.de/xml",
}

NORMALISERS = {
    "greenhouse": _greenhouse,
    "lever": _lever,
    "ashby": _ashby,
    "smartrecruiters": _smartrecruiters,
    "workable": _workable,
    "recruitee": _recruitee,
    "personio": _personio,
}


def fetch(ats, token, company="", company_tier="", extra=None):
    """Poll one company's ATS feed and return normalised jobs (or [] on failure)."""
    ats = ats.lower()
    if ats not in ENDPOINTS:
        return []
    url = ENDPOINTS[ats].format(t=token)
    try:
        resp = _get(url)
        payload = resp.text if ats == "personio" else resp.json()
        rows = NORMALISERS[ats](token, payload)
    except Exception:
        return []
    jobs = []
    for r in rows:
        if not r.get("title"):
            continue
        job = dict(
            company=company or token,
            company_tier=company_tier,
            ats=ats,
            id=f"{company or token}:{ats}:{r['ext']}",
            title=r["title"].strip(),
            location=(r.get("location") or "").strip(),
            url=r.get("url", ""),
            department=(r.get("department") or "").strip(),
            posted=str(r.get("posted") or ""),
        )
        if extra:
            job.update(extra)
        jobs.append(job)
    return jobs
