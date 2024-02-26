local http_server = require("http.server")
local http_headers = require("http.headers")
local template = require("resty.template")

local S = {}

local port = arg[1] or 80
function S.reply(server, stream)
  local headers, msg = stream:get_headers()
  if not headers then print("no headers",msg) end

  local method = headers:get(":method")
  local path = headers:get(":path")

  print(method,path)

  local res = S.create_response(method, path)

  print(res)
  stream:write_headers(res.headers, method == "HEAD")
  if method ~= "HEAD" then
    stream:write_chunk(res.body, true)
  end
end

function S.create_response(method, path)
  if path == "/" then return S.root(method) end
end

function S.root(method)
  local headers = http_headers.new()
  local body
  if method == "GET" then
    headers:append(":status", "200")
    headers:append("content-type", "text/html")
    body = template.compile("index.html") {}
  end
  return { body = body, headers = headers }
end

local my_server = http_server.listen({
  host = "localhost",
  port = port,
  onstream = S.reply,
  onerror = function(myserver, context, op, er, errno)
    print(myserver, context, op, er, errno)
  end
})

local server, error = my_server:listen()
if not server then print(error) end

do
  print(my_server)
  print("listening on", port)
end

my_server:loop()
