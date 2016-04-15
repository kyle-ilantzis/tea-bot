# Tea bot

A slack bot that announces there is tea on the channel you configure.

## Installation

1. clone the git repo or download it as a zip

    $> git clone git@github.com:kyle-ilantzis/tea-bot.git

2. Copy [config.json.template](config.json.template) to config.json and set your
   slack api token for the bot.

3. start the bot

    $> ./run.sh

## Usage

1. Claim the bot

  @tb claim

2. Register the channel

  @tb on #tea

3. Register your types of tea

  @tb g is genmaicha

  @tb c is chai

  ...

4. Broadcast your tea

  @tb g

5. Broadcast that there is some tea left

  @tb l
