# Yuzhang Zhong Academic Homepage

This is a customized [Academic Pages](https://academicpages.github.io/) starter
site for Yuzhang Zhong.

## What Is Already Drafted

- Homepage bio and research-interest framework in `_pages/about.md`
- Publications page with one SNS-Grasp entry in `_publications/`
- Projects page with two starter project entries in `_portfolio/`
- CV framework in `_pages/cv.md`
- Site identity, sidebar, LinkedIn, and navigation in `_config.yml` and
  `_data/navigation.yml`
- A temporary monogram avatar in `images/avatar-yz.svg`

## Before Publishing

Update these fields first:

1. `_config.yml`
   - `url`
   - `repository`
   - `author.email`
   - `author.github`
   - `author.googlescholar`
   - `author.orcid`
2. `_pages/about.md`
   - Confirm the exact wording for UIUC exchange experience.
   - Confirm the official title, institution, advisor, and dates for visiting
     predoctoral / research experience.
3. `_pages/cv.md`
   - Add GPA, honors, coursework, skills, awards, and service if desired.
4. `_portfolio/*.md`
   - Replace TODOs with screenshots, demo links, collaborators, and your exact
     role.
5. `images/avatar-yz.svg`
   - Replace with a real headshot if you prefer.

## Publishing With GitHub Pages

1. Create a GitHub repository named `[your-github-username].github.io`.
2. Push this folder to that repository.
3. In GitHub repository settings, enable GitHub Pages if it is not already
   enabled.
4. Your site will be available at
   `https://[your-github-username].github.io`.

## Local Preview

Academic Pages is a Jekyll site. To preview locally:

```bash
bundle install
bundle exec jekyll serve -l -H localhost
```

Then open `http://localhost:4000`.

On this Windows machine, Ruby was installed at `D:\Tools\Ruby33`. In
PowerShell, you can use:

```powershell
$env:Path = 'D:\Tools\Ruby33\bin;D:\Tools\Ruby33\msys64\usr\bin;' + $env:Path
bundle install
bundle exec jekyll serve -H 127.0.0.1 -P 4000
```
