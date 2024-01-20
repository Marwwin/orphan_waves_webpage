local http_headers = require("http.headers")
local HTMX = {}

function HTMX.new(req)
  req = req or http_headers.new()

  local self = setmetatable({}, { __index = HTMX })
  self.req = req
  return self
end

-- Checks if a request is a HTMX request
-- @param {http_headers}
-- @return {boolean}
function HTMX.is_htmx(req)
  local htmx_headers = {
  "HX-Boosted","HX-Current_URL", "HX-History-Restore-Request"
  }
  for name, value, never_index in req:each() do
    if name:find("HX-") then return true end
  end
end

HTMX.is_htmx()
