<div align="center">

# Yuzhang Zhong · Academic Homepage

**Research, projects, publications, and writing in one place.**

[![Website](https://img.shields.io/badge/Website-yuzhang--zhong.github.io-2563eb)](https://yuzhang-zhong.github.io/)
[![Jekyll](https://img.shields.io/badge/Built_with-Jekyll-cc0000)](https://jekyllrb.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[Visit the site](https://yuzhang-zhong.github.io/) · [Local preview](#local-preview) · [Content guide](#content-guide) · [Publishing](#publishing)

</div>

The source for Yuzhang Zhong's personal academic website, customized from
[Academic Pages](https://academicpages.github.io/). The site uses Jekyll and
GitHub Pages, with dedicated layouts for publications, projects, and blog posts.

## Explore

| On the website | In this repository |
| --- | --- |
| [About](https://yuzhang-zhong.github.io/) | Bio and research interests in [`_pages/about.md`](_pages/about.md) |
| [Publications](https://yuzhang-zhong.github.io/publications/) | Publication records in [`_publications/`](_publications/) |
| [Projects](https://yuzhang-zhong.github.io/portfolio/) | Project pages in [`_portfolio/`](_portfolio/) |
| [Blog](https://yuzhang-zhong.github.io/blog/) | Blog navigation and metadata in [`_data/blog.yml`](_data/blog.yml) |

## Local preview

Install Ruby and Bundler first. The site's Ruby dependencies are declared in
[`Gemfile`](Gemfile).

```bash
git clone https://github.com/yuzhang-zhong/yuzhang-zhong.github.io.git
cd yuzhang-zhong.github.io
bundle install
bundle exec jekyll serve -l -H localhost
```

Open **http://localhost:4000**. Keep the preview running while editing site
content.

<details>
<summary>Windows / PowerShell: using the existing Ruby33 installation path</summary>

If Ruby is installed at `D:\Tools\Ruby33`, add it to the current shell's path
before running Bundler. Adjust these paths for a different installation.

```powershell
$env:Path = 'D:\Tools\Ruby33\bin;D:\Tools\Ruby33\msys64\usr\bin;' + $env:Path
bundle install
bundle exec jekyll serve -H 127.0.0.1 -P 4000
```

</details>

## Content guide

| Change | Entry point |
| --- | --- |
| Site identity, sidebar, and social links | [`_config.yml`](_config.yml) |
| Header links and their order | [`_data/navigation.yml`](_data/navigation.yml) |
| Homepage bio and research interests | [`_pages/about.md`](_pages/about.md) |
| Publication and project entries | [`_publications/`](_publications/) and [`_portfolio/`](_portfolio/) |
| JSON-backed CV data and page | [`_data/cv.json`](_data/cv.json) and [`_pages/cv-json.md`](_pages/cv-json.md) |
| Layouts and reusable components | [`_layouts/`](_layouts/) and [`_includes/`](_includes/) |
| Portraits, project figures, and icons | [`images/`](images/) |

### Content review checklist

Before publishing personal updates or reusing this site:

- Check `url`, `repository`, email, GitHub, Google Scholar, ORCID, and other
  identity fields in `_config.yml`.
- Confirm the exact wording of education and research experience in
  `_pages/about.md`, including the UIUC exchange and any visiting or
  predoctoral role, institution, advisor, and dates.
- Review CV details such as GPA, honors, coursework, skills, awards, and service
  in `_data/cv.json`.
- Replace any remaining project TODOs with accurate roles, collaborators,
  screenshots, and demo links.
- Review profile imagery; `images/avatar-yz.svg` remains available as a
  monogram asset.

## Publishing

This repository already follows GitHub Pages' personal-site naming convention:
`yuzhang-zhong.github.io`.

1. Preview content changes locally.
2. Push the changes to the branch used for the site's deployment.
3. Check **Settings → Pages** for the configured publishing source and
   deployment status.
4. Visit **https://yuzhang-zhong.github.io/**.

When adapting the site for another account, use a repository named
`<your-github-username>.github.io` and update `_config.yml` before publishing.

## Credits and license

Based on [Academic Pages](https://academicpages.github.io/). See
[`LICENSE`](LICENSE) for the repository's MIT license and attribution.
