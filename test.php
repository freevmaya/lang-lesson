<html>
<head>
	
</head>


    <script src="/js/jquery-3.4.1.min.js"></script>
    <script src="/js/jquery-ui.js"></script>
    <script src="/js/functions.js"></script>
    <script src="/js/controls.js"></script>
    <script src="/js/components/puzzle.js"></script>

	<script type="text/javascript">
		function parseTimelineText(str) {
			let list = str.split(/\n/);
			let result = [];

			let n = 0, ni = 0;
			let t;

			for (let i=0; i<list.length; i++) {
				let s = list[i].trim();
				if (s) {
					if (n == 1) {
						let ta = s.split(/-->/); 
						t = [parseTime(ta[0]), parseTime(ta[1]), 0];
					} else if (n == 2) {
						t[2] = s;
						result.push(t);
					}

					n = (n + 1) % 3;
				} else ni++;
			}

			return result;
		}

		$(window).ready(function() {

			console.log(parseTimelineText($('textarea').val()));
			
		});
	</script>
<body>
	<textarea>1
00:00:06.9 --> 00:00:09.460
Sadhguru: So the process

2
00:00:09.46 --> 00:00:15.850
of what you call as spiritual is not a psychological process.

3
00:00:15.85 --> 00:00:19.540
Your memory has nothing to do with it.

4
00:00:19.54 --> 00:00:20.980
It’s a life process;

5
00:00:20.98 --> 00:00:23.771
it's an existential process.

6
00:00:23.771 --> 00:00:25.350
This can only happen

7
00:00:25.35 --> 00:00:31.309
if you allow yourself to be just a piece of life that you are.

8
00:00:32.569 --> 00:00:33.950
To do this,

9
00:00:33.95 --> 00:00:36.539
we do many things here and, you know,

10
00:00:36.539 --> 00:00:41.840
you might have seen people in the ashram walking around with those orange tags.

11
00:00:41.84 --> 00:00:45.209
If you have seen the silence tags people are wearing

12
00:00:45.209 --> 00:00:47.339
just shut up.

13
00:00:48.999 --> 00:00:50.240
Because,

14
00:00:50.24 --> 00:00:54.090
shutting your mouth is only half the job;

15
00:00:58.1 --> 00:00:59.929
to become silent

16
00:01:02.579 --> 00:01:03.769
is possible

17
00:01:03.769 --> 00:01:07.341
only when you do not think much of yourself.

18
00:01:09.181 --> 00:01:12.850
If you think something about yourself,

19
00:01:12.85 --> 00:01:14.371
if you think ‘I am smart’

20
00:01:14.371 --> 00:01:15.911
how can you shut up?

21
00:01:18.591 --> 00:01:20.461
you tell me

22
00:01:20.461 --> 00:01:24.791
If you think ‘I am smart’ how can you shut up?

23
00:01:24.791 --> 00:01:28.911
If you realize that you are actually stupid,

24
00:01:28.911 --> 00:01:32.030
you don't know anything in this existence

25
00:01:32.03 --> 00:01:33.432
then

26
00:01:36.222 --> 00:01:37.300
isn't it?

27
00:01:37.3 --> 00:01:42.300
Then you can simply look at life with great sense of wonder,

28
00:01:42.3 --> 00:01:45.311
without a thought appearing in your mind.

29
00:01:45.311 --> 00:01:48.632
If you think you are smart about everything,

30
00:01:48.632 --> 00:01:53.241
you got explanations and calculations and nonsense going on in your head.

31
00:01:53.241 --> 00:01:57.952
If you see one thing, a thousand thoughts will go off, isn't it?

32
00:02:00.892 --> 00:02:04.693
You are not sitting here in this sathsang totally silent;

33
00:02:04.693 --> 00:02:05.943
you are agreeing with me,

34
00:02:05.943 --> 00:02:07.023
disagreeing with me,

35
00:02:07.023 --> 00:02:08.372
making comments within yourself,

36
00:02:08.372 --> 00:02:12.313
making comments about the clothes that somebody is wearing next to you,

37
00:02:12.313 --> 00:02:13.465
appreciating it,

38
00:02:13.465 --> 00:02:15.125
depreciating it,

39
00:02:15.125 --> 00:02:17.263
everything is happening.

40
00:02:17.263 --> 00:02:19.174
Am I wrong?

41
00:02:22.694 --> 00:02:29.864
Because the moment you think there is some value to what you think

42
00:02:29.864 --> 00:02:32.083
then you can't stop it;

43
00:02:32.083 --> 00:02:34.207
no way to stop it.

44
00:02:34.207 --> 00:02:36.873
It’ll just go on and on and on.

45
00:02:38.233 --> 00:02:43.259
When you see there is absolutely no life value

46
00:02:43.259 --> 00:02:45.548
to your thought process;

47
00:02:45.548 --> 00:02:49.329
it is just memory recycling itself,

48
00:02:50.769 --> 00:02:54.968
it is just the same old nonsense recycling itself

49
00:02:54.968 --> 00:02:57.209
but if you are excited,

50
00:02:57.217 --> 00:03:00.108
if you are enamored by this recycle,

51
00:03:00.108 --> 00:03:03.960
if you think it's great you cannot stop it.

52
00:03:03.96 --> 00:03:06.311
If you see the patterns of what it is,

53
00:03:06.311 --> 00:03:09.139
if you see the stupidity of what it is,

54
00:03:09.139 --> 00:03:14.349
then slowly you will distance yourself and it’ll collapse

55
00:03:14.349 --> 00:03:16.380
because without attention it cannot go on.</textarea>
</body>
</html>