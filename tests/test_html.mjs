import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { escapeHtml, externalLink, highlightText } from '../services/host/app/html.js';

test('text and attributes escape all HTML delimiters', () => {
  assert.equal(escapeHtml('&<>"\''), '&amp;&lt;&gt;&quot;&#39;');
  assert.equal(escapeHtml(null), '');
});

test('external links permit HTTP(S) and escape attributes and captions', () => {
  for(const url of ['javascript:alert(1)', 'data:text/html,test', '//example.org', '/local', 'java\nscript:alert(1)'])
    assert.equal(externalLink(url, 'source'), '');
  assert.match(externalLink('https://example.org/?x="\'', '<source>'), /href="https:\/\/example.org\/\?x=%22(?:&#39;|%27)"/);
  assert.match(externalLink('http://example.org', '<source>'), /&lt;source&gt;<\/a>/);
});

test('highlighting works on original text, never generated markup', () => {
  assert.equal(highlightText('平壤 & □', ['平壤', 'span']), '<span class="hit">平壤</span> &amp; <span class="gap">□</span>');
  assert.equal(highlightText('<img src=x> &lt;', ['<img src=x>', '&']), '<span class="hit">&lt;img src=x&gt;</span> <span class="hit">&amp;</span>lt;');
  assert.equal(highlightText('a+b ab', ['a+b']), '<span class="hit">a+b</span> ab');
});
