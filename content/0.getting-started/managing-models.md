---
title: Managing Models
description: Adding and managing AI Models in Msty Studio
navTruncate: false
---

You can manage AI providers and models from **Model Hub**.

![adding new models](/images/model-hub.png)

## Model Matchmaker

If you're unsure which model is the best for your needs, select **Match Maker** and adjust the scales according to what is most important.

![msty matchmaker](/images/matchmaker.png)

Matchmaker will consider what you are looking for against the strengths of available models, and provide recommendations for which models best match your criteria.

![msty matchmaker ranked models](/images/ranked-models.png)

Now, you have a starting point for which Model Providers and Models to consider using in Msty.

Then, the real fun! Testing the models in Msty to see which one best encapsulates your needs.

BTW - a big part of the charm of Msty is the ability to use multiple models. So, if one model doesn't quite cut it, then consider leveraging two (or more models) where each model provides complimentary skills. Check out [Model Squad](#model-squad) and [Turnstiles](/features/toolsets/turnstiles) for more insights.

## Model Providers

You can edit and remove existing Cloud Providers from the **Model Providers** tab.

You can also add new Providers and Models by selecting **Add Provider**.

As these are mainly Cloud Providers, you will first need to set up and account with the desired provider, generate and copy their API Key, and then add the API Key to Msty when adding a New Provider.

## Local AI Models

You can add and remove Local Models from the **Local AI Models** tab.

The **Featured Models** tab displays popular Local Models that are available for installation.

The **Installed Models** tab displays the models currently installed on your device. You can remove models from this tab to uninstall.

The **Ollama Models** and **Hugging Face Models** tabs allow you to search Ollama and Hugging Face for models that you can install onto your device. As long as the model is public and has an available GGUF (GPT-Generated Unified Format) file for download, then it typically is available to install.

::alert{type="info" icon="tabler:info-circle"}
Msty does not support Safetensors nor split GGUFs.
::

## Model Squad

Model Squad is a collection of specialized AI models to assist with Msty functionality.

As opposed to generic or standard text summaries, you can have GenAI create conversation titles, context shield summaries, and and real-time prompt data synthesis.

This allows you to use an AI that may be better at generating descriptions than the current model that you have selected.

## Set A Default Model

To set a default model, expand the model selection box in the Conversations toolbar and then select the star icon to set the model as the default.
