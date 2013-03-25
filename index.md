---
layout: page
---
{% include JB/setup %}

{% for post in site.posts %}
  <h4><span>{{ post.date | date_to_string }}</span> &rarr; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></h4>
  {{ post.content}}
{% endfor %}


