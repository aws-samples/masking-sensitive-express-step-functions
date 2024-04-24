aws stepfunctions start-execution \
    --name=cli-test-run \
    --state-machine-arn=$STATE_MACHINE_ARN \
    --input="{\"name\":\"John Miller\",\"address\":\"2113 7th Ave, Seattle, WA 98121, United States\",\"key3\":\"test@example.com\",\"order-id\": \"test-order-id\"}"