# Using Firefox to generate PDF with puppeteer

WickedPDF should receive `temp_path` options keys with a path where webserver user has read access.

```ruby
# config/initializers/wicked_pdf.rb

if defined?(WickedPdf)
  WickedPdf.config = {
    exe_path: ENV.fetch("WKHTMLTOPDF_PATH", "/usr/local/bin/wkhtmltopdf"),
    puppeteer_headless_mode: ENV.fetch("PUPPETEER_HEADLESS_MODE", "new"),
    puppeteer_timeout: ENV.fetch("PUPPETEER_TIMEOUT", 30_000),
    use_puppeteer: true,
    temp_path: Rails.root.join("tmp")
  }
end
```

Install firefox for root

```bash
sudo su
cd ~
npx puppeteer browsers install firefox@stable
```

Allow nginx to run node without password

```bash
sudo visudo
```

Add the following line to the end of the file (updating the path to fit your requirements):

```bash
nginx ALL=(ALL) NOPASSWD: /usr/local/bin/node /var/deploy/*/web_head/shared/bundle/ruby/3.2.0/bundler/gems/wicked_pdf-*/lib/wicked_pdf/pdf.js *
```
