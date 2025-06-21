export const config = {
    matcher: "/**", // apply to all routes
  }
  
  export default async function middleware(req) {
    const ua = (req.headers.get("user-agent") || "").toLowerCase();
  
    const blockedAgents = [
      "sqlmap",
      "burpsuite",
      "curl",
      "wget",
      "python",
      "java",
      "httpclient",
      "nmap",
      "masscan",
      "scrapy",
    ];
  
    if (blockedAgents.some(agent => ua.includes(agent))) {
      return new Response("Forbidden", { status: 403 });
    }
  
    return new Response(null, { status: 200 }); // or allow to continue
  }
  