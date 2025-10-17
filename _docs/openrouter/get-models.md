# List all models and their properties

GET https://openrouter.ai/api/v1/models

## OpenAPI Specification

```yaml
openapi: 3.1.1
info:
  title: List all models and their properties
  version: endpoint_models.getModels
paths:
  /models:
    get:
      operationId: get-models
      summary: List all models and their properties
      tags:
        - - subpackage_models
      parameters:
        - name: category
          in: query
          required: false
          schema:
            type: string
        - name: supported_parameters
          in: query
          required: false
          schema:
            type: string
        - name: use_rss
          in: query
          required: false
          schema:
            type: string
        - name: use_rss_chat_links
          in: query
          required: false
          schema:
            type: string
        - name: Authorization
          in: header
          description: API key as bearer token in Authorization header
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Returns a list of models or RSS feed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Models_getModels_Response_200'
components:
  schemas:
    ModelPricingPrompt:
      oneOf:
        - type: number
          format: double
        - type: string
        - description: Any type
    ModelPricingCompletion:
      oneOf:
        - type: number
          format: double
        - type: string
        - description: Any type
    ModelPricingRequest:
      oneOf:
        - type: number
          format: double
        - type: string
        - description: Any type
    ModelPricingImage:
      oneOf:
        - type: number
          format: double
        - type: string
        - description: Any type
    ModelPricingImageOutput:
      oneOf:
        - type: number
          format: double
        - type: string
        - description: Any type
    ModelPricingAudio:
      oneOf:
        - type: number
          format: double
        - type: string
        - description: Any type
    ModelPricingInputAudioCache:
      oneOf:
        - type: number
          format: double
        - type: string
        - description: Any type
    ModelPricingWebSearch:
      oneOf:
        - type: number
          format: double
        - type: string
        - description: Any type
    ModelPricingInternalReasoning:
      oneOf:
        - type: number
          format: double
        - type: string
        - description: Any type
    ModelPricingInputCacheRead:
      oneOf:
        - type: number
          format: double
        - type: string
        - description: Any type
    ModelPricingInputCacheWrite:
      oneOf:
        - type: number
          format: double
        - type: string
        - description: Any type
    ModelPricing:
      type: object
      properties:
        prompt:
          $ref: '#/components/schemas/ModelPricingPrompt'
        completion:
          $ref: '#/components/schemas/ModelPricingCompletion'
        request:
          $ref: '#/components/schemas/ModelPricingRequest'
        image:
          $ref: '#/components/schemas/ModelPricingImage'
        image_output:
          $ref: '#/components/schemas/ModelPricingImageOutput'
        audio:
          $ref: '#/components/schemas/ModelPricingAudio'
        input_audio_cache:
          $ref: '#/components/schemas/ModelPricingInputAudioCache'
        web_search:
          $ref: '#/components/schemas/ModelPricingWebSearch'
        internal_reasoning:
          $ref: '#/components/schemas/ModelPricingInternalReasoning'
        input_cache_read:
          $ref: '#/components/schemas/ModelPricingInputCacheRead'
        input_cache_write:
          $ref: '#/components/schemas/ModelPricingInputCacheWrite'
        discount:
          type: number
          format: double
      required:
        - prompt
        - completion
    ModelGroup:
      type: string
      enum:
        - value: Router
        - value: Media
        - value: Other
        - value: GPT
        - value: Claude
        - value: Gemini
        - value: Grok
        - value: Cohere
        - value: Nova
        - value: Qwen
        - value: Yi
        - value: DeepSeek
        - value: Mistral
        - value: Llama2
        - value: Llama3
        - value: Llama4
        - value: PaLM
        - value: RWKV
        - value: Qwen3
    InstructType:
      type: string
      enum:
        - value: none
        - value: airoboros
        - value: alpaca
        - value: alpaca-modif
        - value: chatml
        - value: claude
        - value: code-llama
        - value: gemma
        - value: llama2
        - value: llama3
        - value: mistral
        - value: nemotron
        - value: neural
        - value: openchat
        - value: phi3
        - value: rwkv
        - value: vicuna
        - value: zephyr
        - value: deepseek-r1
        - value: deepseek-v3.1
        - value: qwq
        - value: qwen3
    InputModality:
      type: string
      enum:
        - value: text
        - value: image
        - value: file
        - value: audio
    OutputModality:
      type: string
      enum:
        - value: text
        - value: image
        - value: embeddings
    ModelArchitecture:
      type: object
      properties:
        tokenizer:
          $ref: '#/components/schemas/ModelGroup'
        instruct_type:
          $ref: '#/components/schemas/InstructType'
        modality:
          type:
            - string
            - 'null'
        input_modalities:
          type: array
          items:
            $ref: '#/components/schemas/InputModality'
        output_modalities:
          type: array
          items:
            $ref: '#/components/schemas/OutputModality'
      required:
        - modality
        - input_modalities
        - output_modalities
    TopProviderInfo:
      type: object
      properties:
        context_length:
          type:
            - number
            - 'null'
          format: double
        max_completion_tokens:
          type:
            - number
            - 'null'
          format: double
        is_moderated:
          type: boolean
      required:
        - is_moderated
    ModelPerRequestLimits:
      type: object
      properties:
        prompt_tokens:
          description: Maximum prompt tokens per request
        completion_tokens:
          description: Maximum completion tokens per request
      required:
        - prompt_tokens
        - completion_tokens
    Parameter:
      type: string
      enum:
        - value: temperature
        - value: top_p
        - value: top_k
        - value: min_p
        - value: top_a
        - value: frequency_penalty
        - value: presence_penalty
        - value: repetition_penalty
        - value: max_tokens
        - value: logit_bias
        - value: logprobs
        - value: top_logprobs
        - value: seed
        - value: response_format
        - value: structured_outputs
        - value: stop
        - value: tools
        - value: tool_choice
        - value: parallel_tool_calls
        - value: include_reasoning
        - value: reasoning
        - value: web_search_options
        - value: verbosity
    DefaultParameters:
      type: object
      properties:
        temperature:
          type:
            - number
            - 'null'
          format: double
        top_p:
          type:
            - number
            - 'null'
          format: double
        frequency_penalty:
          type:
            - number
            - 'null'
          format: double
    Model:
      type: object
      properties:
        id:
          type: string
        canonical_slug:
          type: string
        hugging_face_id:
          type:
            - string
            - 'null'
        name:
          type: string
        created:
          type: number
          format: double
        description:
          type: string
        pricing:
          $ref: '#/components/schemas/ModelPricing'
        context_length:
          type:
            - number
            - 'null'
          format: double
        architecture:
          $ref: '#/components/schemas/ModelArchitecture'
        top_provider:
          $ref: '#/components/schemas/TopProviderInfo'
        per_request_limits:
          oneOf:
            - $ref: '#/components/schemas/ModelPerRequestLimits'
            - type: 'null'
        supported_parameters:
          type: array
          items:
            $ref: '#/components/schemas/Parameter'
        default_parameters:
          $ref: '#/components/schemas/DefaultParameters'
      required:
        - id
        - canonical_slug
        - name
        - created
        - pricing
        - context_length
        - architecture
        - top_provider
        - per_request_limits
        - supported_parameters
        - default_parameters
    Models_getModels_Response_200:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Model'
      required:
        - data

```

## SDK Code Examples

```python
import requests

url = "https://openrouter.ai/api/v1/models"

headers = {"Authorization": "Bearer <token>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://openrouter.ai/api/v1/models';
const options = {method: 'GET', headers: {Authorization: 'Bearer <token>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://openrouter.ai/api/v1/models"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "Bearer <token>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://openrouter.ai/api/v1/models")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = 'Bearer <token>'

response = http.request(request)
puts response.read_body
```

```java
HttpResponse<String> response = Unirest.get("https://openrouter.ai/api/v1/models")
  .header("Authorization", "Bearer <token>")
  .asString();
```

```php
<?php

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://openrouter.ai/api/v1/models', [
  'headers' => [
    'Authorization' => 'Bearer <token>',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://openrouter.ai/api/v1/models");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "Bearer <token>");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["Authorization": "Bearer <token>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://openrouter.ai/api/v1/models")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```