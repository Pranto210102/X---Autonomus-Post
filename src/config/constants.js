export const CONFIG = {
  MAX_RETRIES: 3,
  DEFAULT_TIMEOUT: 30000,
  TARGETS: {
    COMPOSER: 'composer',
    POST_BUTTON: 'post_button',
    VERIFY: 'verify'
  },
  FALLBACK_SELECTORS: {
    composer: '[data-testid="tweetTextarea_0"]',
    post_button: '[data-testid="tweetButtonInline"]',
    timeline_tweet: '[data-testid="tweet"]'
  }
};