---
layout: default
title: "Blog — Hộp bánh Trung Thu & hộp quà"
permalink: /blog/
image: /image/hop-lam-cuc-4-6-banh/hop-lam-cuc-4-6-banh-1.jpg
---

<div class="blog-index">
  <p class="blog-index-lead">Mẹo chọn hộp, bảng giá tham khảo, mẫu mới — cập nhật mùa Trung Thu 2026.</p>

  <div class="blog-card-grid">
{% for post in site.posts %}
    <article class="blog-card">
      {% if post.image %}
      <a href="{{ post.url | relative_url }}" class="blog-card-media" aria-hidden="true" tabindex="-1">
        {% assign post_thumb = post.image | replace: '.jpeg', '-thumb.jpeg' | replace: '.jpg', '-thumb.jpg' %}
        <img src="{{ post_thumb | relative_url }}" alt="" width="400" height="250" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='{{ post.image | relative_url }}';">
      </a>
      {% endif %}
      <time class="blog-card-date" datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | date: "%d/%m/%Y" }}</time>
      <h2 class="blog-card-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
      {% if post.categories and post.categories.size > 0 %}
      <p class="blog-card-tags">
        {% for category in post.categories %}
        <span class="blog-card-tag">{{ category }}</span>
        {% endfor %}
      </p>
      {% endif %}
      <a href="{{ post.url | relative_url }}" class="blog-card-read">Đọc bài →</a>
    </article>
{% endfor %}
  </div>

  <p class="blog-index-footer"><a href="{{ '/' | relative_url }}">← Về trang sản phẩm</a></p>
</div>
