// netlify/functions/tinyurl-proxy.js
// TinyURL API 프록시 — 브라우저 CORS 우회용

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  const url = event.queryStringParameters?.url;
  if (!url) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'url 파라미터가 필요해요' }),
    };
  }

  try {
    const response = await fetch(
      `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      throw new Error(`is.gd 응답 오류: ${response.status}`);
    }

    const shortUrl = (await response.text()).trim();

    // is.gd는 오류 시 "error" 문자열을 반환하는 경우가 있음
    if (!shortUrl.startsWith('http')) {
      throw new Error('유효하지 않은 단축 URL 응답이에요');
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain', ...corsHeaders() },
      body: shortUrl,
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: e.message }),
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
}
