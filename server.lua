local port = arg[1] or 80

local http_server = require("http.server")
local http_headers = require("http.headers")


local function reply(server, stream)
  local headers, msg = stream:get_headers()
  if not headers then print(msg) end

  local method = headers:get(":method")

  print(os.date(), method or "", headers:get(":authority"),headers:get(":scheme"),headers:get(":path"))

  local res = http_headers.new()
  res:append(":status","200")
  res:append("content-type","text/plain")
  stream:write_headers(res,method == "HEAD")
  if method ~= "HEAD" then
    stream:write_chunk("Hello",true)
  end
end


local my_server = http_server.listen({
  host = "localhost",
  port = port,
  onstream = reply,
  onerror = function(myserver, context, op, er, errno)
    print(myserver,context,op,er,errno)
  end
})

local s, er = my_server:listen()
if not s then print(er) end

do
  print(my_server)
  print("listening on", port)
end

my_server:loop()
