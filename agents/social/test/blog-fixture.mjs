/** A blog post that passes the validator's content rules (or fails on length with few words). */
export function blogSource(date, words = 900) {
  const sentence = 'Small business owners can check how search engines read their website pages today.';
  const filler = Array.from({ length: Math.ceil(words / 12) }, () => sentence).join(' ').split(' ').slice(0, words - 30).join(' ');
  return [
    '---',
    'title: "Test post"',
    'description: "A test post."',
    `date: ${date}`,
    '---',
    '',
    filler,
    '',
    '## Next step',
    '',
    'Want to know where you stand? Ask for our free AI visibility check and we will check if ChatGPT and Google mention your business.',
    '',
    '## Sources',
    '',
    '- [Google Search Central](https://developers.google.com/search/blog)',
    '',
  ].join('\n');
}
