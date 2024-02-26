local http_headers = require("http.headers")
local Response = {}

local metatable = { __index = Response }

setmetatable(Response, metatable)

function Response.new(status, content_type, body)
  local headers = http_headers.new()
  headers:append(":status", status)
  headers:append("content-type", content_type)
  return setmetatable({ headers = headers, body = body })
end

return Response
