---
layout: default
title: "Blog — Hộp bánh Trung Thu & hộp quà"
permalink: /blog/
---

<div class="blog-index">
  <p class="blog-index-lead">Mẹo chọn hộp, bảng giá tham khảo, mẫu mới — cập nhật mùa Trung Thu 2026.</p>

  <div class="blog-card-grid">
{% for post in site.posts %}
    <article class="blog-card">
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
