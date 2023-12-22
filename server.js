const puppeteer = require("puppeteer");
const schedule = require("node-schedule");

// Define your URLs
const urls = [
"https://streamsgate.net/dashboard/basketball",
"https://streamsgate.net/dashboard/ice-hockey",
"https://streamsgate.net/dashboard/american-football",
"https://streamsgate.net/dashboard/boxing"
];

// Function to run the script for a given URL
async function runScriptForURL(url) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const cookies = [
    {
      name: "laravel_session",
      value:
        "eyJpdiI6Inh0bEdhUzg0eW56Tm9COW9JdTJlYVE9PSIsInZhbHVlIjoidnVKL3lSY0NNbkVBM0p5MXBwQ04waW5sYnZPYTcyVC82N216UTFZT3JXMUhkVnE2UVVnUjhzR0h5Sk8vNTdLVVhsczdISzEyYk1zU3dkRVY5SU5OVjJ0Ym9mdDc4RkxUdUxMN3FLUVZiRnErT0t4UDlpNEdwOVlOaW1heVJ2a2YiLCJtYWMiOiIzZmRkNWZmYzM0YjJhYWYxNzE0NGZhYTU5ZDZmY2M3Mjk2YTZhYTI0ZjVhMDU4ZmExMDRhM2NhMThmMjY1ZTEyIiwidGFnIjoiIn0%3D",
      domain: "streamsgate.net",
    },
    {
      name: "remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d",
      value:
        "eyJpdiI6IjJnQjN0NlhnSEhldi9mWnVVYkJ1d2c9PSIsInZhbHVlIjoidjRHSUMvd3BiQm1qSlRxcDgrVTNlR2dJUVE0YTU5dld2YlQ4NGdqaWNXQzlZc1FSTlJId1VZc0ljVXNtUDBoODRaOGhuREtXcE1PUncwWDRObFV2YTFTTS9Ud1B2V3N4a3h0SmlITldodEpxK1pNb3N2cmV1b21vSzlCeHNIMkUxR3BKTlpOSk41MS84KzJuajhId1hBTDdGTDhxdU0rY09xbXJMR2t5QlRmZE5kMkVVWG1seDB2b2JnY2dod2Z5U1FUNENMOUxETXNKRVNjOW1vUG0xNUFRai84NzBxZUpiZ3J3NVpXL1NkZz0iLCJtYWMiOiI5NTQ1MGU5OGE1OGRmZjlhN2FkNDZjOTI3ODY0OWRkMjk0NGRiYjBkNTAyNGM0NDdlODkwODg5MWNkMGNlMGFmIiwidGFnIjoiIn0%3D",
      domain: "streamsgate.net",
    },
    {
      name: "XSRF-TOKEN",
      value:
        "eyJpdiI6IkRSK1BqbVVFdlc5cUZRR04wR05nV2c9PSIsInZhbHVlIjoibUhiOFd5VU9hNFRPay8rNTVTTTFZS1dIWFRmaEEzeHh3WEU4Ymw2RWo4cWJ2UHM2MjBwYnMyU24wUGFQUFYvTnNpOVlKWVpKUEF6QkRlWUdVVklab1FjbGphWldNRWhPbVZkN3QyV0xlL3RyeE9YNTlNVWljU21COGdyblEyemIiLCJtYWMiOiI4MTg1MTJlZGNmMTIyMWM0MzdiZTM3ZTIyNTgyNGVmMWJhYTNlNGVlZDFiMTExOGYxZTllMDgwOTU5NTlmNDRjIiwidGFnIjoiIn0%3D",
      domain: "streamsgate.net",
    },
  ];

  await page.setCookie(...cookies);

  // Navigate to the specified URL
  await page.goto(url, {timeout: 60000});

  // Execute your script within the page context
  await page.evaluate(async () => {
    // Your script logic here
    var newData = {
      date: "",
      competitions: "all",
      search: "",
      status: "all",
      limit: $(".total").text(),
      type: $("#type").val(),
      _token: $('meta[name="csrf-token"]').attr("content"),
    };

    var mappedMatches = [];

    async function _getInfoLinkStreamOfMatch(
      requestUrl,
      method,
      params,
      hideDetail = true
    ) {
      try {
        var res = await callAjax(requestUrl, method, params);
        var statusCode = res.statusCode;

        if (statusCode === 2) {
          var streams = res.data;

          if (streams.matches && streams.matches.length > 0) {
            // Map the matches array to the global variable
            mappedMatches = streams.matches.map((match) => ({
              matchId: match.match_id,
              homeTeam: match.home_name,
              awayTeam: match.away_name,
              status: match.status,
              competition: match.competition,
              startTime: match.start_time, // Keep the original start time
              // Add more properties as needed
            }));

            // Get the current time in the local time zone
            var currentTime = moment.utc(); // Use UTC for the current time

            // Iterate over mappedMatches and make Ajax calls for events less than 50 hours away
            mappedMatches.forEach((match) => {
              // Convert start time to a moment object
              var startTime = moment.utc(match.startTime);

              // Calculate the time difference in hours
              var timeDifference = startTime.diff(currentTime, "hours");

              // Check if the event is less than 50 hours away
              if (timeDifference < 50 && timeDifference >= 0) {
                var data = {
                  _token: $('meta[name="csrf-token"]').attr("content"),
                  match_id: match.matchId,
                  channel_name: "ESPN + HD",
                  link: "http://me.btsports.online/p/ncaablinks1.html",
                  stream_type: "Web",
                  quality: "HD",
                  language: "English",
                  ads: "1",
                  bitrate: "4000",
                  misr: "2MB",
                  visible: true,
                  mobile_compatible: true,
                  nsfw: false,
                  adblock: false,
                  type: $("#type").val(),
                };

                console.log("Making Ajax call for match:", match.matchId);
                MakeActualAjaxCall("/add/stream", "POST", data);
              }
            });
          }
        } else {
          console.error("Error:", res.message);
        }

        $("#loading").fadeOut(500);
      } catch (error) {
        console.error("Error:", error);
        $("#loading").fadeOut(500);
      }
    }

    // Correct function call
    await _getInfoLinkStreamOfMatch("/dashboard/", "POST", newData);

    async function MakeActualAjaxCall(url, method, data) {
      try {
        await $.ajax({
          url: url,
          data: data,
          type: method,
        });

        console.log("Posted Successfully");
      } catch (err) {
        console.error("Error:", err);
      }
    }
  });

  // Close the browser
  setTimeout(() => browser.close(), 60000);
}

// Function to run the entire program
async function runProgram() {
  // Iterate over each URL and run the script
  for (const url of urls) {
    await runScriptForURL(url);
  }
}

// Run the program initially
runProgram();

schedule.scheduleJob("19 * * * *", async () => {
  // Run the program every hour at 1 minute past the hour
  await runProgram();
});
