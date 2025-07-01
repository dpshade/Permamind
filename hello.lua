Handlers.add("Hello", Handlers.utils.hasMatchingTag("Action", "Hello"), function(msg)
    if msg.Recipient then
        ao.send({
            Target = msg.From,
            Data = "Hello " .. msg.Recipient
        })
    end
end)
