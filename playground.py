#!/usr/bin/python
# -*- coding: utf-8 -*-

from lxml import etree
from StringIO import StringIO


xml = """<?xml version="1.0" encoding="UTF-8"?>
<GoodreadsResponse>
    <Request>
        <authentication>true</authentication>
        <key>
            <![CDATA[q6aRaB6CGONdJWTWa8Q2Q]]>
        </key>
        <method>
            <![CDATA[review_list]]>
        </method>
    </Request>
    <reviews start="1" end="20" total="144">
        <review>
            <id>1921311319</id>
            <book>
                <id type="integer">34330839</id>
                <isbn nil="true"/>
                <isbn13>9786073149891</isbn13>
                <text_reviews_count type="integer">1</text_reviews_count>
                <title>Homo Deus</title>
                <image_url>https://images.gr-assets.com/books/1487687456m/34330839.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1487687456s/34330839.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/34330839-homo-deus</link>
                <num_pages>489</num_pages>
                <format>Paperback</format>
                <edition_information/>
                <publisher>DEBATE</publisher>
                <publication_day>21</publication_day>
                <publication_year>2017</publication_year>
                <publication_month>2</publication_month>
                <average_rating>4.39</average_rating>
                <ratings_count>2566</ratings_count>
                <description>Yuval Noah Harari, author of the best-selling Sapiens: A Brief History of Humankind, envisions a not-too-distant world in which we face a new set of challenges. Now, in Homo Deus, he examines our future with his trademark blend of science, history, philosophy and every discipline in between.&lt;br /&gt;&lt;br /&gt;Homo Deus explores the projects, dreams and nightmares that will shape the 21st century - from overcoming death to creating artificial life. It asks the fundamental questions: where do we go from here? And how will we protect this fragile world from our own destructive powers?&lt;br /&gt;&lt;br /&gt;This is the next stage of evolution. This is Homo Deus. War is obsolete. You are more likely to commit suicide than be killed in conflict. Famine is disappearing. You are at more risk of obesity than starvation. Death is just a technical problem. Equality is out - but immortality is in. What does our future hold?</description>
                <authors>
                    <author>
                        <id>395812</id>
                        <name>Yuval Noah Harari</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1388657767p5/395812.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1388657767p2/395812.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/395812.Yuval_Noah_Harari]]>
                        </link>
                        <average_rating>4.36</average_rating>
                        <ratings_count>46220</ratings_count>
                        <text_reviews_count>4378</text_reviews_count>
                    </author>
                </authors>
                <published>2017</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="to-read" exclusive="true" review_shelf_id="1577738184" sortable="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Wed Feb 22 03:47:21 -0800 2017</date_added>
            <date_updated>Wed Feb 22 03:47:21 -0800 2017</date_updated>
            <read_count>0</read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1921311319]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1921311319]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1908787449</id>
            <book>
                <id type="integer">3828902</id>
                <isbn>1603580557</isbn>
                <isbn13>9781603580557</isbn13>
                <text_reviews_count type="integer">248</text_reviews_count>
                <title>Thinking in Systems: A Primer</title>
                <image_url>https://images.gr-assets.com/books/1390169859m/3828902.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1390169859s/3828902.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/3828902-thinking-in-systems</link>
                <num_pages>240</num_pages>
                <format>Paperback</format>
                <edition_information/>
                <publisher>Chelsea Green Publishing</publisher>
                <publication_day>3</publication_day>
                <publication_year>2008</publication_year>
                <publication_month>12</publication_month>
                <average_rating>4.22</average_rating>
                <ratings_count>3065</ratings_count>
                <description>In the years following her role as the lead author of the international bestseller, &lt;i&gt;Limits to Growth&lt;/i&gt;—the first book to show the consequences of unchecked growth on a finite planet— Donella Meadows remained a pioneer of environmental and social analysis until her untimely death in 2001.&lt;br /&gt;&lt;br /&gt;Meadows’ newly released manuscript, &lt;i&gt;Thinking in Systems&lt;/i&gt;, is a concise and crucial book offering insight for problem solving on scales ranging from the personal to the global. Edited by the Sustainability Institute’s Diana Wright, this essential primer brings systems thinking out of the realm of computers and equations and into the tangible world, showing readers how to develop the systems-thinking skills that thought leaders across the globe consider critical for 21st-century life.&lt;br /&gt;&lt;br /&gt;Some of the biggest problems facing the world—war, hunger, poverty, and environmental degradation—are essentially system failures. They cannot be solved by fixing one piece in isolation from the others, because even seemingly minor details have enormous power to undermine the best efforts of too-narrow thinking.&lt;br /&gt;&lt;br /&gt;While readers will learn the conceptual tools and methods of systems thinking, the heart of the book is grander than methodology. Donella Meadows was known as much for nurturing positive outcomes as she was for delving into the science behind global dilemmas. She reminds readers to pay attention to what is important, not just what is quantifiable, to stay humble, and to stay a learner.&lt;br /&gt;&lt;br /&gt;In a world growing ever more complicated, crowded, and interdependent, &lt;i&gt;Thinking in Systems&lt;/i&gt; helps readers avoid confusion and helplessness, the first step toward finding proactive and effective solutions.</description>
                <authors>
                    <author>
                        <id>307638</id>
                        <name>Donella H. Meadows</name>
                        <role></role>
                        <image_url nophoto='true'>
                            <![CDATA[https://s.gr-assets.com/assets/nophoto/user/f_200x266-3061b784cc8e7f021c6430c9aba94587.png]]>
                        </image_url>
                        <small_image_url nophoto='true'>
                            <![CDATA[https://s.gr-assets.com/assets/nophoto/user/f_50x66-6a03a5c12233c941481992b82eea8d23.png]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/307638.Donella_H_Meadows]]>
                        </link>
                        <average_rating>4.21</average_rating>
                        <ratings_count>4202</ratings_count>
                        <text_reviews_count>379</text_reviews_count>
                    </author>
                </authors>
                <published>2008</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="to-read" exclusive="true" review_shelf_id="1565523261" sortable="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Fri Feb 10 00:20:11 -0800 2017</date_added>
            <date_updated>Fri Feb 10 00:20:12 -0800 2017</date_updated>
            <read_count>0</read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1908787449]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1908787449]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1892927922</id>
            <book>
                <id type="integer">22326</id>
                <isbn>0140157727</isbn>
                <isbn13>9780140157727</isbn13>
                <text_reviews_count type="integer">274</text_reviews_count>
                <title>Virtual Light (Bridge, #1)</title>
                <image_url>https://images.gr-assets.com/books/1409238094m/22326.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1409238094s/22326.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/22326.Virtual_Light</link>
                <num_pages>304</num_pages>
                <format>Paperback</format>
                <edition_information/>
                <publisher>Penguin Books Ltd</publisher>
                <publication_day>26</publication_day>
                <publication_year>1996</publication_year>
                <publication_month>10</publication_month>
                <average_rating>3.83</average_rating>
                <ratings_count>17854</ratings_count>
                <description>Berry Rydell, an ex-cop, signs on with IntenSecure Armed Response in Los Angeles. He finds himself on a collision course that results in a desperate romance, and a journey into the ecstasy and dread that mirror each other at the heart of the postmodern experience.</description>
                <authors>
                    <author>
                        <id>9226</id>
                        <name>William Gibson</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1373826214p5/9226.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1373826214p2/9226.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/9226.William_Gibson]]>
                        </link>
                        <average_rating>3.87</average_rating>
                        <ratings_count>452954</ratings_count>
                        <text_reviews_count>17113</text_reviews_count>
                    </author>
                </authors>
                <published>1996</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="to-read" exclusive="true" review_shelf_id="1550125028" sortable="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Thu Jan 26 10:57:52 -0800 2017</date_added>
            <date_updated>Thu Jan 26 10:57:53 -0800 2017</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1892927922]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1892927922]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1881600671</id>
            <book>
                <id type="integer">20518872</id>
                <isbn>0765377063</isbn>
                <isbn13>9780765377067</isbn13>
                <text_reviews_count type="integer">3711</text_reviews_count>
                <title>The Three-Body Problem (Remembrance of Earth’s Past, #1)</title>
                <image_url>https://images.gr-assets.com/books/1415428227m/20518872.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1415428227s/20518872.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/20518872-the-three-body-problem</link>
                <num_pages>400</num_pages>
                <format>Hardcover</format>
                <edition_information/>
                <publisher>Tor Books</publisher>
                <publication_day>11</publication_day>
                <publication_year>2014</publication_year>
                <publication_month>11</publication_month>
                <average_rating>3.99</average_rating>
                <ratings_count>32122</ratings_count>
                <description>&lt;i&gt;The Three-Body Problem&lt;/i&gt; is the first chance for English-speaking readers to experience this multiple award winning phenomenon from China's most beloved science fiction author, Liu Cixin.&lt;br /&gt;&lt;br /&gt;Set against the backdrop of China's Cultural Revolution, a secret military project sends signals into space to establish contact with aliens. An alien civilization on the brink of destruction captures the signal and plans to invade Earth. Meanwhile, on Earth, different camps start forming, planning to either welcome the superior beings and help them take over a world seen as corrupt, or to fight against the invasion. The result is a science fiction masterpiece of enormous scope and vision.</description>
                <authors>
                    <author>
                        <id>5780686</id>
                        <name>Liu Cixin</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1454974329p5/5780686.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1454974329p2/5780686.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/5780686.Liu_Cixin]]>
                        </link>
                        <average_rating>4.13</average_rating>
                        <ratings_count>52349</ratings_count>
                        <text_reviews_count>6970</text_reviews_count>
                    </author>
                </authors>
                <published>2014</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="currently-reading" exclusive="true" review_shelf_id="1545549861" sortable="false" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at>Sun Jan 22 05:07:24 -0800 2017</started_at>
            <read_at></read_at>
            <date_added>Mon Jan 16 09:33:54 -0800 2017</date_added>
            <date_updated>Sun Jan 22 05:07:24 -0800 2017</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1881600671]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1881600671]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1880070724</id>
            <book>
                <id type="integer">22514020</id>
                <isbn>158333467X</isbn>
                <isbn13>9781583334676</isbn13>
                <text_reviews_count type="integer">572</text_reviews_count>
                <title>NeuroTribes: The Legacy of Autism and the Future of Neurodiversity</title>
                <image_url>https://images.gr-assets.com/books/1421707890m/22514020.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1421707890s/22514020.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/22514020-neurotribes</link>
                <num_pages>477</num_pages>
                <format>Hardcover</format>
                <edition_information>First Edition (U.S.)</edition_information>
                <publisher>Avery/Penguin Random House LLC</publisher>
                <publication_day>25</publication_day>
                <publication_year>2015</publication_year>
                <publication_month>8</publication_month>
                <average_rating>4.31</average_rating>
                <ratings_count>3782</ratings_count>
                <description>&lt;b&gt;A &lt;i&gt;New York Times&lt;/i&gt; bestseller&lt;br /&gt;&lt;br /&gt;&lt;b&gt;Winner of the 2015 Samuel Johnson Prize for non-fiction&lt;/b&gt;&lt;br /&gt;&lt;br /&gt;A groundbreaking book that upends conventional thinking about autism and suggests a broader model for acceptance, understanding, and full participation in society for people who think differently.&lt;/b&gt;&lt;br /&gt;  &lt;br /&gt; What is autism? A lifelong disability, or a naturally occurring form of cognitive difference akin to certain forms of genius? In truth, it is all of these things and more—and the future of our society depends on our understanding it. &lt;i&gt;WIRED&lt;/i&gt; reporter Steve Silberman unearths the secret history of autism, long suppressed by the same clinicians who became famous for discovering it, and finds surprising answers to the crucial question of why the number of diagnoses has soared in recent years.&lt;br /&gt;  &lt;br /&gt; Going back to the earliest days of autism research and chronicling the brave and lonely journey of autistic people and their families through the decades, Silberman provides long-sought solutions to the autism puzzle, while mapping out a path for our society toward a more humane world in which people with learning differences and those who love them have access to the resources they need to live happier, healthier, more secure, and more meaningful lives.&lt;br /&gt;  &lt;br /&gt; Along the way, he reveals the untold story of Hans Asperger, the father of Asperger’s syndrome, whose “little professors” were targeted by the darkest social-engineering experiment in human history; exposes the covert campaign by child psychiatrist Leo Kanner to suppress knowledge of the autism spectrum for fifty years; and casts light on the growing movement of "neurodiversity" activists seeking respect, support, technological innovation, accommodations in the workplace and in education, and the right to self-determination for those with cognitive differences.</description>
                <authors>
                    <author>
                        <id>3892405</id>
                        <name>Steve Silberman</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1449234450p5/3892405.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1449234450p2/3892405.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/3892405.Steve_Silberman]]>
                        </link>
                        <average_rating>4.30</average_rating>
                        <ratings_count>3862</ratings_count>
                        <text_reviews_count>669</text_reviews_count>
                    </author>
                </authors>
                <published>2015</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="to-read" exclusive="true" review_shelf_id="1537847274" sortable="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Sun Jan 15 05:35:20 -0800 2017</date_added>
            <date_updated>Sun Jan 15 05:35:21 -0800 2017</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1880070724]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1880070724]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1880070345</id>
            <book>
                <id type="integer">18079689</id>
                <isbn>1594205655</isbn>
                <isbn13>9781594205651</isbn13>
                <text_reviews_count type="integer">86</text_reviews_count>
                <title>Social Physics: How Good Ideas Spread— The Lessons from a New Science</title>
                <image_url>https://images.gr-assets.com/books/1387175849m/18079689.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1387175849s/18079689.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/18079689-social-physics</link>
                <num_pages>320</num_pages>
                <format>Hardcover</format>
                <edition_information/>
                <publisher>Penguin Press</publisher>
                <publication_day>30</publication_day>
                <publication_year>2014</publication_year>
                <publication_month>1</publication_month>
                <average_rating>3.49</average_rating>
                <ratings_count>647</ratings_count>
                <description>&lt;i&gt;From one of the world’s leading data scientists, a landmark tour ofthe new science of idea flow, offering revolutionary insights into the mysteries of collective intelligence and social influence&lt;/i&gt;&lt;br /&gt;&lt;br /&gt; If the Big Data revolution has a presiding genius, it is MIT’s Alex "Sandy" Pentland. Over years of groundbreaking experiments, he has distilled remarkable discoveries significant enough to become the bedrock of a whole new scientific field: social physics. Humans have more in common with bees than we like to admit: We’re social creatures first and foremost. Our most important habits of action—and most basic notions of common sense—are wired into us through our coordination in social groups. Social physics is about &lt;i&gt;idea flow&lt;/i&gt;, the way human social networks spread ideas and transform those ideas into behaviors.&lt;br /&gt;&lt;br /&gt; Thanks to the millions of digital bread crumbs people leave behind via smartphones, GPS devices, and the Internet, the amount of new information we have about human activity is truly profound. Until now, sociologists have depended on limited data sets and surveys that tell us how people &lt;i&gt;say&lt;/i&gt; they think and behave, rather than what they actually &lt;i&gt;do&lt;/i&gt;. As a result, we’ve been stuck with the same stale social structures—classes, markets—and a focus on individual actors, data snapshots, and steady states. Pentland shows that, in fact, humans respond much more powerfully to social incentives that involve rewarding others and strengthening the ties that bind than incentives that involve only their own economic self-interest.&lt;br /&gt;&lt;br /&gt; Pentland and his teams have found that they can study &lt;i&gt;patterns &lt;/i&gt;of information exchange in a social network without any knowledge of the actual &lt;i&gt;content &lt;/i&gt;of the information and predict with stunning accuracy how productive and effective that network is, whether it’s a business or an entire city. We can maximize a group’s collective intelligence to improve performance and use social incentives to create new organizations and guide them through disruptive change in a way that maximizes the good. At every level of interaction, from small groups to large cities, social networks can be tuned to increase exploration and engagement, thus vastly improving idea flow.  &lt;br /&gt;&lt;i&gt;Social Physics&lt;/i&gt; will change the way we think about how we learn and how our social groups work—and can be made to work better, at every level of society. Pentland leads readers to the edge of the most important revolution in the study of social behavior in a generation, an entirely new way to look at life itself.</description>
                <authors>
                    <author>
                        <id>452879</id>
                        <name>Alex Pentland</name>
                        <role></role>
                        <image_url nophoto='true'>
                            <![CDATA[https://s.gr-assets.com/assets/nophoto/user/u_200x266-e183445fd1a1b5cc7075bb1cf7043306.png]]>
                        </image_url>
                        <small_image_url nophoto='true'>
                            <![CDATA[https://s.gr-assets.com/assets/nophoto/user/u_50x66-632230dc9882b4352d753eedf9396530.png]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/452879.Alex_Pentland]]>
                        </link>
                        <average_rating>3.45</average_rating>
                        <ratings_count>818</ratings_count>
                        <text_reviews_count>114</text_reviews_count>
                    </author>
                </authors>
                <published>2014</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="to-read" exclusive="true" review_shelf_id="1537846944" sortable="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Sun Jan 15 05:34:48 -0800 2017</date_added>
            <date_updated>Sun Jan 15 05:34:48 -0800 2017</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1880070345]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1880070345]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1878091138</id>
            <book>
                <id type="integer">25823558</id>
                <isbn>0190217014</isbn>
                <isbn13>9780190217013</isbn13>
                <text_reviews_count type="integer">2</text_reviews_count>
                <title>Surfing Uncertainty: Prediction, Action, and the Embodied Mind</title>
                <image_url>https://images.gr-assets.com/books/1435661794m/25823558.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1435661794s/25823558.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/25823558-surfing-uncertainty</link>
                <num_pages>416</num_pages>
                <format>Hardcover</format>
                <edition_information/>
                <publisher>Oxford University Press</publisher>
                <publication_day>2</publication_day>
                <publication_year>2015</publication_year>
                <publication_month>11</publication_month>
                <average_rating>4.28</average_rating>
                <ratings_count>36</ratings_count>
                <description>How is it that thoroughly physical material beings such as ourselves can think, dream, feel, create and understand ideas, theories and concepts? How does mere matter give rise to all these non-material mental states, including consciousness itself? An answer to this central question of our existence is emerging at the busy intersection of neuroscience, psychology, artificial intelligence, and robotics.&lt;br /&gt;&lt;br /&gt;In this groundbreaking work, philosopher and cognitive scientist Andy Clark explores exciting new theories from these fields that reveal minds like ours to be prediction machines - devices that have evolved to anticipate the incoming streams of sensory stimulation before they arrive. These predictions then initiate actions that structure our worlds and alter the very things we need to engage and predict. Clark takes us on a journey in discovering the circular causal flows and the self-structuring of the environment that define "the predictive brain." What emerges is a bold, new, cutting-edge vision that reveals the brain as our driving force in the daily surf through the waves of sensory stimulation.</description>
                <authors>
                    <author>
                        <id>3445871</id>
                        <name>Andy  Clark</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1269856267p5/3445871.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1269856267p2/3445871.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/3445871.Andy_Clark]]>
                        </link>
                        <average_rating>3.86</average_rating>
                        <ratings_count>800</ratings_count>
                        <text_reviews_count>53</text_reviews_count>
                    </author>
                </authors>
                <published>2015</published>
            </book>
            <rating>5</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="read" exclusive="true" />
                <shelf name="favorites" exclusive="false" review_shelf_id="1535995951" sortable="false" />
                <shelf name="neuroscience" exclusive="false" review_shelf_id="1535988181" sortable="false" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Fri Jan 13 11:58:57 -0800 2017</date_added>
            <date_updated>Fri Jan 13 12:07:53 -0800 2017</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1878091138]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1878091138]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1870786463</id>
            <book>
                <id type="integer">17736859</id>
                <isbn>0307907414</isbn>
                <isbn13>9780307907417</isbn13>
                <text_reviews_count type="integer">286</text_reviews_count>
                <title>The Story of the Human Body: Evolution, Health, and Disease</title>
                <image_url>https://images.gr-assets.com/books/1375545961m/17736859.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1375545961s/17736859.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/17736859-the-story-of-the-human-body</link>
                <num_pages>480</num_pages>
                <format>ebook</format>
                <edition_information/>
                <publisher>Vintage</publisher>
                <publication_day>1</publication_day>
                <publication_year>2013</publication_year>
                <publication_month>10</publication_month>
                <average_rating>4.19</average_rating>
                <ratings_count>3036</ratings_count>
                <description>&lt;b&gt;A landmark book of popular science—a lucid, engaging account of how the human body evolved over millions of years and of how the increasing disparity between the jumble of adaptations in our Stone Age bodies and the modern world is fueling the paradox of greater longevity but more chronic disease.  &lt;/b&gt;&lt;br /&gt;&lt;b&gt; &lt;/b&gt;&lt;br /&gt;In a book that illuminates, as never before, the evolutionary story of the human body, Daniel Lieberman deftly examines the major transformations that contributed key adaptations to the body: the advent of bipedalism; the shift to a non-fruit-based diet; the rise of hunting and gathering and our superlative endurance athletic abilities; the development of a very large brain; and the incipience of modern cultural abilities. He elucidates how cultural evolution differs from biological evolution, and how it further transformed our bodies during the Agricultural and Industrial Revolutions. Lieberman illuminates how these ongoing changes have brought many benefits, but also have created novel conditions to which our bodies are not entirely adapted, resulting in a growing incidence of obesity and new but avoidable diseases, including type-2 diabetes. He proposes that many of these chronic illnesses persist and in some cases are intensifying because of "dysevolution," a pernicious dynamic whereby only the symptoms rather than the causes of these maladies are treated. And finally—provocatively—he advocates the use of evolutionary information to help nudge, push, and sometimes oblige us to create a more salubrious environment.&lt;br /&gt;&lt;br /&gt;(With charts and line drawings throughout.)&lt;br /&gt;&lt;br /&gt;&lt;br /&gt;&lt;i&gt;From the Hardcover edition.&lt;/i&gt;</description>
                <authors>
                    <author>
                        <id>3186364</id>
                        <name>Daniel E. Lieberman</name>
                        <role></role>
                        <image_url nophoto='true'>
                            <![CDATA[https://s.gr-assets.com/assets/nophoto/user/m_200x266-d279b33f8eec0f27b7272477f09806be.png]]>
                        </image_url>
                        <small_image_url nophoto='true'>
                            <![CDATA[https://s.gr-assets.com/assets/nophoto/user/m_50x66-82093808bca726cb3249a493fbd3bd0f.png]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/3186364.Daniel_E_Lieberman]]>
                        </link>
                        <average_rating>4.19</average_rating>
                        <ratings_count>3069</ratings_count>
                        <text_reviews_count>342</text_reviews_count>
                    </author>
                </authors>
                <published>2013</published>
            </book>
            <rating>5</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="read" exclusive="true" />
                <shelf name="biology" exclusive="false" review_shelf_id="1529195167" sortable="false" />
                <shelf name="evolution" exclusive="false" review_shelf_id="1529195237" sortable="false" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at>Sun Jan 08 19:50:19 -0800 2017</read_at>
            <date_added>Sat Jan 07 19:46:09 -0800 2017</date_added>
            <date_updated>Sat Jan 07 19:50:19 -0800 2017</date_updated>
            <read_count></read_count>
            <body>
                <![CDATA[Detailed look into where we came from. Fascinated by the theories looking at our enlarging brains and relationship with group size -- interesting to think that an early selective pressure may have been for a larger neocortex to handle increasingly complex social relationships and the need to cooperate. I wasn't expecting the applications to public health at the end, but Lieberman's evolutionary lens on 'mismatch' diseases was compelling and now intuitive.]]>

            </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1870786463]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1870786463]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1864570814</id>
            <book>
                <id type="integer">12935037</id>
                <isbn nil="true"/>
                <isbn13 nil="true"/>
                <text_reviews_count type="integer">47</text_reviews_count>
                <title>Principles</title>
                <image_url>https://images.gr-assets.com/books/1474267287m/12935037.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1474267287s/12935037.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/12935037-principles</link>
                <num_pages>106</num_pages>
                <format>ebook</format>
                <edition_information/>
                <publisher>www.bwater.com</publisher>
                <publication_day/>
                <publication_year>2011</publication_year>
                <publication_month/>
                <average_rating>4.39</average_rating>
                <ratings_count>504</ratings_count>
                <description>Abstract: What follows are three distinct parts that can be read either independently or as a connected whole. Part 1 is about the purpose and importance of having principles in general, having nothing to do with mine. Part 2 explains my most fundamental life principles that apply to everything I do. Part 3, explains my management principles as they are being lived out at Bridgewater. Since my management principles are simply my most fundamental life principles applied to management, reading Part 2 will help you to better understand Part 3, but it’s not required—you can go directly to Part 3 to see what my management principles are and how Bridgewater has been run. One day I’d like to write a Part 4 on my investment principles. If you are looking to get the most bang for your buck (i.e., understanding for the effort), I suggest that you read Parts 1 and 2, and the beginning of Part 3 (through the Summary and Table of Principles) which will give you nearly the whole picture. It’s only about 55 pages of a normal size book. &lt;br /&gt;&lt;br /&gt;Above all else, I want you to think for yourself—to decide 1) what you want, 2) what is true and 3) what to do about it. I want you to do that in a clear-headed thoughtful way, so that you get what you want. I wrote this book to help you do that. I am going to ask only two things of you—1) that you be open-minded and 2) that you honestly answer some questions about what you want, what is true and what you want to do about it. If you do these things, I believe that you will get a lot out of this book. If you can’t do these things, you should reflect on why that is, because you probably have discovered one of your greatest impediments to getting what you want out of life.</description>
                <authors>
                    <author>
                        <id>5289593</id>
                        <name>Ray Dalio</name>
                        <role></role>
                        <image_url nophoto='true'>
                            <![CDATA[https://s.gr-assets.com/assets/nophoto/user/u_200x266-e183445fd1a1b5cc7075bb1cf7043306.png]]>
                        </image_url>
                        <small_image_url nophoto='true'>
                            <![CDATA[https://s.gr-assets.com/assets/nophoto/user/u_50x66-632230dc9882b4352d753eedf9396530.png]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/5289593.Ray_Dalio]]>
                        </link>
                        <average_rating>4.39</average_rating>
                        <ratings_count>532</ratings_count>
                        <text_reviews_count>52</text_reviews_count>
                    </author>
                </authors>
                <published>2011</published>
            </book>
            <rating>4</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="read" exclusive="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at>Fri Jan 06 00:00:00 -0800 2017</read_at>
            <date_added>Tue Jan 03 16:18:09 -0800 2017</date_added>
            <date_updated>Sat Jan 07 19:44:45 -0800 2017</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1864570814]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1864570814]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1864565076</id>
            <book>
                <id type="integer">20697435</id>
                <isbn>055341884X</isbn>
                <isbn13>9780553418842</isbn13>
                <text_reviews_count type="integer">2337</text_reviews_count>
                <title>The Book of Strange New Things</title>
                <image_url>https://images.gr-assets.com/books/1394824754m/20697435.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1394824754s/20697435.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/20697435-the-book-of-strange-new-things</link>
                <num_pages>500</num_pages>
                <format>Hardcover</format>
                <edition_information/>
                <publisher>Hogarth</publisher>
                <publication_day>28</publication_day>
                <publication_year>2014</publication_year>
                <publication_month>10</publication_month>
                <average_rating>3.67</average_rating>
                <ratings_count>19113</ratings_count>
                <description>It begins with Peter, a devoted man of faith, as he is called to the mission of a lifetime, one that takes him galaxies away from his wife, Bea. Peter becomes immersed in the mysteries of an astonishing new environment, overseen by an enigmatic corporation known only as USIC. His work introduces him to a seemingly friendly native population struggling with a dangerous illness and hungry for Peter’s teachings—his Bible is their “book of strange new things.” But Peter is rattled when Bea’s letters from home become increasingly desperate: typhoons and earthquakes are devastating whole countries, and governments are crumbling. Bea’s faith, once the guiding light of their lives, begins to falter. &lt;br /&gt;&lt;br /&gt;Suddenly, a separation measured by an otherworldly distance, and defined both by one newly discovered world and another in a state of collapse, is threatened by an ever-widening gulf that is much less quantifiable. While Peter is reconciling the needs of his congregation with the desires of his strange employer, Bea is struggling for survival. Their trials lay bare a profound meditation on faith, love tested beyond endurance, and our responsibility to those closest to us. &lt;br /&gt;&lt;br /&gt;Marked by the same bravura storytelling and precise language that made &lt;i&gt;The Crimson Petal and the White&lt;/i&gt; such an international success, &lt;i&gt;The Book of Strange New Things&lt;/i&gt; is extraordinary, mesmerizing, and replete with emotional complexity and genuine pathos.</description>
                <authors>
                    <author>
                        <id>16272</id>
                        <name>Michel Faber</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1417041854p5/16272.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1417041854p2/16272.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/16272.Michel_Faber]]>
                        </link>
                        <average_rating>3.84</average_rating>
                        <ratings_count>161850</ratings_count>
                        <text_reviews_count>11746</text_reviews_count>
                    </author>
                </authors>
                <published>2014</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="to-read" exclusive="true" review_shelf_id="1523568572" sortable="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Tue Jan 03 16:14:00 -0800 2017</date_added>
            <date_updated>Tue Jan 03 16:14:00 -0800 2017</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1864565076]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1864565076]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1856042259</id>
            <book>
                <id type="integer">25666050</id>
                <isbn>1627790365</isbn>
                <isbn13>9781627790369</isbn13>
                <text_reviews_count type="integer">281</text_reviews_count>
                <title>Algorithms to Live By: The Computer Science of Human Decisions</title>
                <image_url>https://images.gr-assets.com/books/1454296875m/25666050.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1454296875s/25666050.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/25666050-algorithms-to-live-by</link>
                <num_pages>368</num_pages>
                <format>Hardcover</format>
                <edition_information/>
                <publisher>Henry Holt and Co.</publisher>
                <publication_day>19</publication_day>
                <publication_year>2016</publication_year>
                <publication_month>4</publication_month>
                <average_rating>4.17</average_rating>
                <ratings_count>2516</ratings_count>
                <description>&lt;b&gt;A fascinating exploration of how insights from computer algorithms can be applied to our everyday lives, helping to solve common decision-making problems and illuminate the workings of the human mind&lt;/b&gt;&lt;br /&gt;&lt;br /&gt;All our lives are constrained by limited space and time, limits that give rise to a particular set of problems. What should we do, or leave undone, in a day or a lifetime? How much messiness should we accept? What balance of new activities and familiar favorites is the most fulfilling? These may seem like uniquely human quandaries, but they are not: computers, too, face the same constraints, so computer scientists have been grappling with their version of such issues for decades. And the solutions they've found have much to teach us.&lt;br /&gt;&lt;br /&gt;In a dazzlingly interdisciplinary work, acclaimed author Brian Christian and cognitive scientist Tom Griffiths show how the algorithms used by computers can also untangle very human questions. They explain how to have better hunches and when to leave things to chance, how to deal with overwhelming choices and how best to connect with others. From finding a spouse to finding a parking spot, from organizing one's inbox to understanding the workings of memory, &lt;i&gt;Algorithms to Live By&lt;/i&gt; transforms the wisdom of computer science into strategies for human living.</description>
                <authors>
                    <author>
                        <id>4199891</id>
                        <name>Brian Christian</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1453834169p5/4199891.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1453834169p2/4199891.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/4199891.Brian_Christian]]>
                        </link>
                        <average_rating>4.03</average_rating>
                        <ratings_count>5573</ratings_count>
                        <text_reviews_count>721</text_reviews_count>
                    </author>
                </authors>
                <published>2016</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="to-read" exclusive="true" review_shelf_id="1515970909" sortable="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Thu Dec 29 17:03:29 -0800 2016</date_added>
            <date_updated>Thu Dec 29 17:03:30 -0800 2016</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1856042259]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1856042259]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1846884346</id>
            <book>
                <id type="integer">25744928</id>
                <isbn>1455586692</isbn>
                <isbn13>9781455586691</isbn13>
                <text_reviews_count type="integer">814</text_reviews_count>
                <title>Deep Work: Rules for Focused Success in a Distracted World</title>
                <image_url>https://images.gr-assets.com/books/1447957962m/25744928.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1447957962s/25744928.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/25744928-deep-work</link>
                <num_pages>296</num_pages>
                <format>Hardcover</format>
                <edition_information/>
                <publisher>Grand Central Publishing</publisher>
                <publication_day>5</publication_day>
                <publication_year>2016</publication_year>
                <publication_month>1</publication_month>
                <average_rating>4.19</average_rating>
                <ratings_count>9367</ratings_count>
                <description>&lt;b&gt;One of the most valuable skills in our economy is becoming increasingly rare. If you master this skill, you'll achieve extraordinary results.&lt;/b&gt;&lt;br /&gt;&lt;br /&gt;Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time. Deep work will make you better at what you do and provide the sense of true fulfillment that comes from craftsmanship. In short, deep work is like a super power in our increasingly competitive twenty-first century economy. And yet, most people have lost the ability to go deep-spending their days instead in a frantic blur of e-mail and social media, not even realizing there's a better way.&lt;br /&gt;&lt;br /&gt;In &lt;i&gt;Deep Work&lt;/i&gt;, author and professor Cal Newport flips the narrative on impact in a connected age. Instead of arguing distraction is bad, he instead celebrates the power of its opposite. Dividing this book into two parts, he first makes the case that in almost any profession, cultivating a deep work ethic will produce massive benefits. He then presents a rigorous training regimen, presented as a series of four "rules," for transforming your mind and habits to support this skill.&lt;br /&gt;&lt;br /&gt;A mix of cultural criticism and actionable advice, &lt;i&gt;Deep Work&lt;/i&gt; takes the reader on a journey through memorable stories-from Carl Jung building a stone tower in the woods to focus his mind, to a social media pioneer buying a round-trip business class ticket to Tokyo to write a book free from distraction in the air-and no-nonsense advice, such as the claim that most serious professionals should quit social media and that you should practice being bored. &lt;i&gt;Deep Work&lt;/i&gt; is an indispensable guide to anyone seeking focused success in a distracted world.</description>
                <authors>
                    <author>
                        <id>147891</id>
                        <name>Cal Newport</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1347995468p5/147891.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1347995468p2/147891.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/147891.Cal_Newport]]>
                        </link>
                        <average_rating>4.12</average_rating>
                        <ratings_count>22021</ratings_count>
                        <text_reviews_count>2211</text_reviews_count>
                    </author>
                </authors>
                <published>2016</published>
            </book>
            <rating>3</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="read" exclusive="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at>Tue Dec 20 00:00:00 -0800 2016</started_at>
            <read_at>Sun Dec 25 00:00:00 -0800 2016</read_at>
            <date_added>Thu Dec 22 12:50:23 -0800 2016</date_added>
            <date_updated>Sun Dec 25 22:32:16 -0800 2016</date_updated>
            <read_count></read_count>
            <body>
                <![CDATA[Smart people recommended this book but it could have been boiled down to a much shorter and more effective list of recommendations with a few pieces of evidence each. In many ways parallel to Essentialism, which was a worse offender of not practicing the ideology preached. There are some useful ideas in here, but nothing groundbreaking.]]>

            </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1846884346]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1846884346]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1845930548</id>
            <book>
                <id type="integer">25776132</id>
                <isbn>1101870532</isbn>
                <isbn13>9781101870532</isbn13>
                <text_reviews_count type="integer">137</text_reviews_count>
                <title>The Brain: The Story of You</title>
                <image_url>https://images.gr-assets.com/books/1442830952m/25776132.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1442830952s/25776132.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/25776132-the-brain</link>
                <num_pages>224</num_pages>
                <format>Hardcover</format>
                <edition_information/>
                <publisher>Pantheon</publisher>
                <publication_day>6</publication_day>
                <publication_year>2015</publication_year>
                <publication_month>10</publication_month>
                <average_rating>4.15</average_rating>
                <ratings_count>1427</ratings_count>
                <description>Locked in the silence and darkness of your skull, your brain fashions the rich narratives of your reality and your identity. Join renowned neuroscientist David Eagleman for a journey into the questions at the mysterious heart of our existence. What is reality? Who are “you”? How do you make decisions? Why does your brain need other people? How is technology poised to change what it means to be human?  In the course of his investigations, Eagleman guides us through the world of extreme sports, criminal justice, facial expressions, genocide, brain surgery, gut feelings, robotics, and the search for immortality.  Strap in for a whistle-stop tour into the inner cosmos. In the infinitely dense tangle of billions of brain cells and their trillions of connections, something emerges that you might not have expected to see in there: you. </description>
                <authors>
                    <author>
                        <id>2883386</id>
                        <name>David Eagleman</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1238026723p5/2883386.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1238026723p2/2883386.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/2883386.David_Eagleman]]>
                        </link>
                        <average_rating>4.04</average_rating>
                        <ratings_count>28418</ratings_count>
                        <text_reviews_count>2898</text_reviews_count>
                    </author>
                </authors>
                <published>2015</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="to-read" exclusive="true" review_shelf_id="1506946382" sortable="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Wed Dec 21 12:38:05 -0800 2016</date_added>
            <date_updated>Wed Dec 21 12:38:05 -0800 2016</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1845930548]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1845930548]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1845930307</id>
            <book>
                <id type="integer">9827912</id>
                <isbn>0307377334</isbn>
                <isbn13>9780307377333</isbn13>
                <text_reviews_count type="integer">587</text_reviews_count>
                <title>Incognito: The Secret Lives of the Brain</title>
                <image_url>https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png</image_url>
                <small_image_url>https://s.gr-assets.com/assets/nophoto/book/50x75-a91bf249278a81aabab721ef782c4a74.png</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/9827912-incognito</link>
                <num_pages>304</num_pages>
                <format>Hardcover</format>
                <edition_information/>
                <publisher>Pantheon</publisher>
                <publication_day>31</publication_day>
                <publication_year>2011</publication_year>
                <publication_month>5</publication_month>
                <average_rating>3.97</average_rating>
                <ratings_count>16976</ratings_count>
                <description>&lt;p&gt;&lt;b&gt;If the conscious mind—the part you consider you—accounts for only a tiny fraction of the brain’s function, what is all the rest doing? This is the question that David Eagleman—renowned neuroscientist and acclaimed author of Sum—answers in a book as accessible and entertaining as it is deeply informed by startling, up-to-the-minute research. &lt;/b&gt;&lt;br /&gt;&lt;b&gt; &lt;/b&gt;&lt;br /&gt;Our behavior, thoughts, and experiences are inseparably yoked to a vast, wet, electrochemical network called the nervous system. The machinery is utterly alien to us, and yet, somehow, it &lt;i&gt;is &lt;/i&gt;us. In this dazzling journey, David Eagleman plumbs the depths of the brain to illuminate surprising mysteries: Why does the conscious mind know so little about itself? Why can your foot jump halfway to the brake pedal before you become consciously aware of danger ahead? What do Odysseus and the subprime mortgage meltdown have in common? Why do strippers make more money at certain times of the month? Why are people whose name begins with J more likely to marry other people whose name begins with J? Why did Thomas Edison electrocute an elephant? Why is it so difficult to keep a secret? &lt;br /&gt; &lt;br /&gt;This mind-blowing voyage into the inner cosmos includes stopovers in mate-selection, synesthesia, beauty, free will, infidelity, artificial intelligence, visual illusions, dreams, and the future of criminal law. Throughout, Eagleman helps us understand how our perceptions of ourselves and our world result from the hidden workings of the most wondrous thing we have ever encountered: the human brain.&lt;/p&gt;</description>
                <authors>
                    <author>
                        <id>2883386</id>
                        <name>David Eagleman</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1238026723p5/2883386.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1238026723p2/2883386.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/2883386.David_Eagleman]]>
                        </link>
                        <average_rating>4.04</average_rating>
                        <ratings_count>28418</ratings_count>
                        <text_reviews_count>2898</text_reviews_count>
                    </author>
                </authors>
                <published>2011</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="to-read" exclusive="true" review_shelf_id="1506946143" sortable="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Wed Dec 21 12:37:47 -0800 2016</date_added>
            <date_updated>Wed Dec 21 12:37:48 -0800 2016</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1845930307]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1845930307]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1841155213</id>
            <book>
                <id type="integer">13330444</id>
                <isbn>1400043131</isbn>
                <isbn13>9781400043132</isbn13>
                <text_reviews_count type="integer">870</text_reviews_count>
                <title>All That Is</title>
                <image_url>https://images.gr-assets.com/books/1344618906m/13330444.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1344618906s/13330444.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/13330444-all-that-is</link>
                <num_pages>290</num_pages>
                <format>Hardcover</format>
                <edition_information/>
                <publisher>Knopf</publisher>
                <publication_day>2</publication_day>
                <publication_year>2013</publication_year>
                <publication_month>4</publication_month>
                <average_rating>3.35</average_rating>
                <ratings_count>5798</ratings_count>
                <description>An extraordinary literary event, a major new novel by the PEN/Faulkner winner and acclaimed master: a sweeping, seductive, deeply moving story set in the years after World War II.&lt;br /&gt;&lt;br /&gt; From his experiences as a young naval officer in battles off Okinawa, Philip Bowman returns to America and finds a position as a book editor. It is a time when publishing is still largely a private affair—a scattered family of small houses here and in Europe—a time of gatherings in fabled apartments and conversations that continue long into the night. In this world of dinners, deals, and literary careers, Bowman finds that he fits in perfectly. But despite his success, what eludes him is love. His first marriage goes bad, another fails to happen, and finally he meets a woman who enthralls him—before setting him on a course he could never have imagined for himself. &lt;br /&gt;&lt;br /&gt; Romantic and haunting, &lt;i&gt;All That Is&lt;/i&gt; explores a life unfolding in a world on the brink of change. It is a dazzling, sometimes devastating labyrinth of love and ambition, a fiercely intimate account of the great shocks and grand pleasures of being alive. &lt;br /&gt;</description>
                <authors>
                    <author>
                        <id>11298</id>
                        <name>James Salter</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1360177449p5/11298.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1360177449p2/11298.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/11298.James_Salter]]>
                        </link>
                        <average_rating>3.76</average_rating>
                        <ratings_count>22909</ratings_count>
                        <text_reviews_count>3167</text_reviews_count>
                    </author>
                </authors>
                <published>2013</published>
            </book>
            <rating>3</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="read" exclusive="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at>Fri Dec 16 12:12:53 -0800 2016</started_at>
            <read_at>Thu Dec 22 13:54:48 -0800 2016</read_at>
            <date_added>Fri Dec 16 12:12:53 -0800 2016</date_added>
            <date_updated>Thu Dec 22 13:54:48 -0800 2016</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1841155213]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1841155213]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1838880150</id>
            <book>
                <id type="integer">18077875</id>
                <isbn>0804137382</isbn>
                <isbn13>9780804137386</isbn13>
                <text_reviews_count type="integer">1433</text_reviews_count>
                <title>Essentialism: The Disciplined Pursuit of Less</title>
                <image_url>https://images.gr-assets.com/books/1403165375m/18077875.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1403165375s/18077875.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/18077875-essentialism</link>
                <num_pages>260</num_pages>
                <format>Hardcover</format>
                <edition_information/>
                <publisher>Crown Business</publisher>
                <publication_day>15</publication_day>
                <publication_year>2014</publication_year>
                <publication_month>4</publication_month>
                <average_rating>3.98</average_rating>
                <ratings_count>15266</ratings_count>
                <description>Have you ever found yourself stretched too thin?&lt;br /&gt; &lt;br /&gt;Do you simultaneously feel overworked and underutilized?&lt;br /&gt; &lt;br /&gt;Are you often busy but not productive?&lt;br /&gt; &lt;br /&gt;Do you feel like your time is constantly being hijacked by other people’s agendas?&lt;br /&gt; &lt;br /&gt;If you answered yes to any of these, the way out is the &lt;i&gt;Way of the Essentialist&lt;/i&gt;&lt;b&gt;.&lt;/b&gt;&lt;br /&gt; &lt;br /&gt;The Way of the Essentialist isn’t about getting more done in less time. It’s about getting &lt;i&gt;only the right things&lt;/i&gt; done.  It is not  a time management strategy, or a productivity technique. It is a &lt;i&gt;systematic discipline&lt;/i&gt; for discerning what is absolutely essential, then eliminating everything that is not, so we can make the highest possible contribution towards the things that really matter.  &lt;br /&gt;&lt;br /&gt;By forcing us to apply a more selective criteria for what is Essential, the disciplined pursuit of less empowers us to reclaim control of our own choices about where to spend our precious time and energy – instead of giving others the implicit permission to choose for us.&lt;br /&gt;&lt;br /&gt;Essentialism is not one more thing – it’s a whole new way of doing everything. A must-read for any leader, manager, or individual who wants to learn who to do less, but better, in every area of their lives, Essentialism  is a movement whose time has come.</description>
                <authors>
                    <author>
                        <id>4040962</id>
                        <name>Greg McKeown</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1401260438p5/4040962.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1401260438p2/4040962.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/4040962.Greg_McKeown]]>
                        </link>
                        <average_rating>3.97</average_rating>
                        <ratings_count>17954</ratings_count>
                        <text_reviews_count>1851</text_reviews_count>
                    </author>
                </authors>
                <published>2014</published>
            </book>
            <rating>2</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="read" exclusive="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Wed Dec 14 00:50:48 -0800 2016</date_added>
            <date_updated>Sun Dec 25 22:30:42 -0800 2016</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1838880150]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1838880150]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1830798977</id>
            <book>
                <id type="integer">49628</id>
                <isbn>0375507256</isbn>
                <isbn13>9780375507250</isbn13>
                <text_reviews_count type="integer">14176</text_reviews_count>
                <title>Cloud Atlas</title>
                <image_url>https://images.gr-assets.com/books/1406383769m/49628.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1406383769s/49628.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/49628.Cloud_Atlas</link>
                <num_pages>509</num_pages>
                <format>Paperback</format>
                <edition_information/>
                <publisher>Random House</publisher>
                <publication_day>17</publication_day>
                <publication_year>2004</publication_year>
                <publication_month>8</publication_month>
                <average_rating>4.01</average_rating>
                <ratings_count>165140</ratings_count>
                <description>&lt;i&gt;Cloud Atlas&lt;/i&gt; begins in 1850 with Adam Ewing, an American notary voyaging from the Chatham Isles to his home in California. Along the way, Ewing is befriended by a physician, Dr. Goose, who begins to treat him for a rare species of brain parasite. . . . Abruptly, the action jumps to Belgium in 1931, where Robert Frobisher, a disinherited bisexual composer, contrives his way into the household of an infirm maestro who has a beguiling wife and a nubile daughter. . . . From there we jump to the West Coast in the 1970s and a troubled reporter named Luisa Rey, who stumbles upon a web of corporate greed and murder that threatens to claim her life. . . . And onward, with dazzling virtuosity, to an inglorious present-day England; to a Korean superstate of the near future where neocapitalism has run amok; and, finally, to a postapocalyptic Iron Age Hawaii in the last days of history.&lt;br /&gt;&lt;br /&gt;But the story doesn’t end even there. The narrative then boomerangs back through centuries and space, returning by the same route, in reverse, to its starting point. Along the way, Mitchell reveals how his disparate characters connect, how their fates intertwine, and how their souls drift across time like clouds across the sky.&lt;br /&gt;&lt;br /&gt;As wild as a videogame, as mysterious as a Zen koan, &lt;i&gt;Cloud Atlas&lt;/i&gt; is an unforgettable tour de force that, like its incomparable author, has transcended its cult classic status to become a worldwide phenomenon.</description>
                <authors>
                    <author>
                        <id>6538289</id>
                        <name>David Mitchell</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1409248688p5/6538289.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1409248688p2/6538289.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/6538289.David_Mitchell]]>
                        </link>
                        <average_rating>3.94</average_rating>
                        <ratings_count>389542</ratings_count>
                        <text_reviews_count>43928</text_reviews_count>
                    </author>
                </authors>
                <published>2004</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="to-read" exclusive="true" review_shelf_id="1492414761" sortable="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Mon Dec 05 15:42:28 -0800 2016</date_added>
            <date_updated>Mon Dec 05 15:42:28 -0800 2016</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1830798977]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1830798977]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1828256148</id>
            <book>
                <id type="integer">27276428</id>
                <isbn>1476733503</isbn>
                <isbn13>9781476733500</isbn13>
                <text_reviews_count type="integer">768</text_reviews_count>
                <title>The Gene: An Intimate History</title>
                <image_url>https://images.gr-assets.com/books/1463591739m/27276428.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1463591739s/27276428.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/27276428-the-gene</link>
                <num_pages>592</num_pages>
                <format>Hardcover</format>
                <edition_information/>
                <publisher>Scribner</publisher>
                <publication_day>17</publication_day>
                <publication_year>2016</publication_year>
                <publication_month>5</publication_month>
                <average_rating>4.35</average_rating>
                <ratings_count>5628</ratings_count>
                <description>From the Pulitzer Prize-winning, bestselling author of &lt;i&gt;The Emperor of All Maladies&lt;/i&gt;—a magnificent history of the gene and a response to the defining question of the future: What becomes of being human when we learn to “read” and “write” our own genetic information?&lt;br /&gt;&lt;br /&gt;Siddhartha Mukherjee has a written a biography of the gene as deft, brilliant, and illuminating as his extraordinarily successful biography of cancer. Weaving science, social history, and personal narrative to tell us the story of one of the most important conceptual breakthroughs of modern times, Mukherjee animates the quest to understand human heredity and its surprising influence on our lives, personalities, identities, fates, and choices.&lt;br /&gt;&lt;br /&gt;Throughout the narrative, the story of Mukherjee’s own family—with its tragic and bewildering history of mental illness—cuts like a bright, red line, reminding us of the many questions that hang over our ability to translate the science of genetics from the laboratory to the real world. In superb prose and with an instinct for the dramatic scene, he describes the centuries of research and experimentation—from Aristotle and Pythagoras to Mendel and Darwin, from Boveri and Morgan to Crick, Watson and Franklin, all the way through the revolutionary twenty-first century innovators who mapped the human genome.&lt;br /&gt;&lt;br /&gt;As &lt;i&gt;The New Yorker&lt;/i&gt; said of &lt;i&gt;The Emperor of All Maladies&lt;/i&gt;, “It’s hard to think of many books for a general audience that have rendered any area of modern science and technology with such intelligence, accessibility, and compassion…An extraordinary achievement.” Riveting, revelatory, and magisterial history of a scientific idea coming to life, and an essential preparation for the moral complexity introduced by our ability to create or “write” the human genome, &lt;i&gt;The Gene&lt;/i&gt; is a must-read for everyone concerned about the definition and future of humanity. This is the most crucial science of our time, intimately explained by a master.</description>
                <authors>
                    <author>
                        <id>3032451</id>
                        <name>Siddhartha Mukherjee</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1461962032p5/3032451.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1461962032p2/3032451.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/3032451.Siddhartha_Mukherjee]]>
                        </link>
                        <average_rating>4.27</average_rating>
                        <ratings_count>57063</ratings_count>
                        <text_reviews_count>5663</text_reviews_count>
                    </author>
                </authors>
                <published>2016</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="to-read" exclusive="true" review_shelf_id="1489978311" sortable="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Fri Dec 02 18:20:48 -0800 2016</date_added>
            <date_updated>Fri Dec 02 18:20:49 -0800 2016</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1828256148]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1828256148]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1824328510</id>
            <book>
                <id type="integer">3228917</id>
                <isbn>0316017922</isbn>
                <isbn13>9780316017923</isbn13>
                <text_reviews_count type="integer">17382</text_reviews_count>
                <title>Outliers: The Story of Success</title>
                <image_url>https://images.gr-assets.com/books/1344266315m/3228917.jpg</image_url>
                <small_image_url>https://images.gr-assets.com/books/1344266315s/3228917.jpg</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/3228917-outliers</link>
                <num_pages>309</num_pages>
                <format>Hardcover</format>
                <edition_information/>
                <publisher>Little, Brown and Company</publisher>
                <publication_day>18</publication_day>
                <publication_year>2008</publication_year>
                <publication_month>11</publication_month>
                <average_rating>4.10</average_rating>
                <ratings_count>352141</ratings_count>
                <description>In this stunning new book, Malcolm Gladwell takes us on an intellectual journey through the world of "outliers"--the best and the brightest, the most famous and the most successful. He asks the question: what makes high-achievers different?&lt;br /&gt;&lt;br /&gt;His answer is that we pay too much attention to what successful people are like, and too little attention to where they are from: that is, their culture, their family, their generation, and the idiosyncratic experiences of their upbringing. Along the way he explains the secrets of software billionaires, what it takes to be a great soccer player, why Asians are good at math, and what made the Beatles the greatest rock band.</description>
                <authors>
                    <author>
                        <id>1439</id>
                        <name>Malcolm Gladwell</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1224601838p5/1439.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1224601838p2/1439.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/1439.Malcolm_Gladwell]]>
                        </link>
                        <average_rating>3.95</average_rating>
                        <ratings_count>1335400</ratings_count>
                        <text_reviews_count>52938</text_reviews_count>
                    </author>
                </authors>
                <published>2008</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="to-read" exclusive="true" review_shelf_id="1486250607" sortable="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Mon Nov 28 14:33:37 -0800 2016</date_added>
            <date_updated>Mon Nov 28 14:33:38 -0800 2016</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1824328510]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1824328510]]>
            </link>
            <owned>0</owned>
        </review>
        <review>
            <id>1824328330</id>
            <book>
                <id type="integer">6596</id>
                <isbn>1878424505</isbn>
                <isbn13>9781878424501</isbn13>
                <text_reviews_count type="integer">4621</text_reviews_count>
                <title>The Four Agreements: A Practical Guide to Personal Freedom</title>
                <image_url>https://s.gr-assets.com/assets/nophoto/book/111x148-bcc042a9c91a29c1d680899eff700a03.png</image_url>
                <small_image_url>https://s.gr-assets.com/assets/nophoto/book/50x75-a91bf249278a81aabab721ef782c4a74.png</small_image_url>
                <large_image_url/>
                <link>https://www.goodreads.com/book/show/6596.The_Four_Agreements</link>
                <num_pages>168</num_pages>
                <format>Hardcover</format>
                <edition_information/>
                <publisher>Amber-Allen Publishing</publisher>
                <publication_day>14</publication_day>
                <publication_year>2001</publication_year>
                <publication_month>9</publication_month>
                <average_rating>4.11</average_rating>
                <ratings_count>104477</ratings_count>
                <description>In &lt;i&gt;The Four Agreements&lt;/i&gt;, don Miguel Ruiz reveals the source of self-limiting beliefs that rob us of joy and create needless suffering. Based on ancient Toltec wisdom, the Four Agreements offer a powerful code of conduct that can rapidly transform our lives to a new experience of freedom, true happiness, and love. The Four Agreements are: Be Impeccable With Your Word, Don't Take Anything Personally, Don't Make Assumptions, Always Do Your Best.</description>
                <authors>
                    <author>
                        <id>4402</id>
                        <name>Miguel Ruiz</name>
                        <role></role>
                        <image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1428604894p5/4402.jpg]]>
                        </image_url>
                        <small_image_url nophoto='false'>
                            <![CDATA[https://images.gr-assets.com/authors/1428604894p2/4402.jpg]]>
                        </small_image_url>
                        <link>
                            <![CDATA[https://www.goodreads.com/author/show/4402.Miguel_Ruiz]]>
                        </link>
                        <average_rating>4.15</average_rating>
                        <ratings_count>145676</ratings_count>
                        <text_reviews_count>7351</text_reviews_count>
                    </author>
                </authors>
                <published>2001</published>
            </book>
            <rating>0</rating>
            <votes>0</votes>
            <spoiler_flag>false</spoiler_flag>
            <spoilers_state>none</spoilers_state>
            <shelves>
                <shelf name="read" exclusive="true" />
            </shelves>
            <recommended_for></recommended_for>
            <recommended_by></recommended_by>
            <started_at></started_at>
            <read_at></read_at>
            <date_added>Mon Nov 28 14:33:23 -0800 2016</date_added>
            <date_updated>Tue Dec 27 19:23:57 -0800 2016</date_updated>
            <read_count></read_count>
            <body>
  </body>
            <comments_count>0</comments_count>
            <url>
                <![CDATA[https://www.goodreads.com/review/show/1824328330]]>
            </url>
            <link>
                <![CDATA[https://www.goodreads.com/review/show/1824328330]]>
            </link>
            <owned>0</owned>
        </review>
    </reviews>
</GoodreadsResponse>
"""

data = etree.parse(StringIO(xml))
for r in  data.getroot().find('reviews').findall('review'):
    book = r.find('book')
    isbn = book.find('isbn13').text
    image_url = book.find('image_url').text
    title = book.find('title').text
    authors = book.find('authors')
    first_author = authors.find('author')
    author = None
    if first_author is not None:
        name = first_author.find('name')
        if name is not None:
            author = name.text
    print author


