---
layout: page
---
{% include JB/setup %}

{% for post in site.posts %}
  <h3><a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></h3>
  <div class="index-post">
  {{ post.content}}
  </div>
{% endfor %}