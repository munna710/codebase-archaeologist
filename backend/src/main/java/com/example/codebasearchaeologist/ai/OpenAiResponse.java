package com.example.codebasearchaeologist.ai;

import java.util.List;

public class OpenAiResponse {

    private List<Choice> choices;

    public List<Choice> getChoices() { return choices; }
    public void setChoices(List<Choice> choices) { this.choices = choices; }

    public static class Choice {
        private OpenAiRequest.Message message;

        public OpenAiRequest.Message getMessage() { return message; }
        public void setMessage(OpenAiRequest.Message message) { this.message = message; }
    }
}