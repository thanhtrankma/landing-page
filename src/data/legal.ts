// Default text for the two legal pages. It is copied into the database on first import and can then be
// edited or hidden from /admin/pages. {{phone}}, {{email}}, {{address}} and {{updated}} are replaced when rendered.
export type LegalDefault = { slug: string; title: string; description: string; content: string };

const privacy = `
<p class="legal-lead">SuperLanding (“<strong>chúng tôi</strong>”) hiểu rằng thông tin cá nhân là tài sản của bạn. Chính sách này giải thích chúng tôi thu thập những dữ liệu nào, dùng vào việc gì, chia sẻ với ai, lưu trong bao lâu và bạn có những quyền gì đối với dữ liệu của mình khi sử dụng website và dịch vụ của SuperLanding.</p>
<p><em>Cập nhật lần cuối: {{updated}}</em></p>

<h2>1. Phạm vi áp dụng</h2>
<p>Chính sách áp dụng cho tất cả người truy cập website SuperLanding, người gửi biểu mẫu tư vấn, người nhắn tin cho chúng tôi qua điện thoại, Zalo, email và khách hàng sử dụng dịch vụ thiết kế website, landing page, tối ưu SEO do SuperLanding cung cấp. Các trang demo, mẫu giao diện nằm trong website chỉ mang tính minh họa và không thu thập dữ liệu cá nhân của bạn.</p>

<h2>2. Cơ sở pháp lý</h2>
<p>Chúng tôi xử lý dữ liệu cá nhân phù hợp với pháp luật Việt Nam, bao gồm:</p>
<ul>
  <li>Nghị định 13/2023/NĐ-CP của Chính phủ về bảo vệ dữ liệu cá nhân;</li>
  <li>Luật An ninh mạng năm 2018 và các văn bản hướng dẫn;</li>
  <li>Luật Giao dịch điện tử năm 2023;</li>
  <li>Luật Bảo vệ quyền lợi người tiêu dùng năm 2023;</li>
  <li>Bộ luật Dân sự năm 2015 và các quy định liên quan khác.</li>
</ul>

<h2>3. Dữ liệu chúng tôi thu thập</h2>
<h3>3.1. Dữ liệu bạn chủ động cung cấp</h3>
<ul>
  <li><strong>Biểu mẫu “Gửi yêu cầu tư vấn”:</strong> họ và tên, số điện thoại và nội dung yêu cầu bạn nhập; kèm theo là trang bạn gửi biểu mẫu và thông tin trình duyệt (User-Agent) để chúng tôi phân biệt yêu cầu thật với thư rác.</li>
  <li><strong>Liên hệ qua điện thoại, Zalo, email:</strong> thông tin bạn tự nguyện chia sẻ trong quá trình trao đổi, ví dụ tên doanh nghiệp, ngành nghề, tài liệu, hình ảnh, website tham khảo.</li>
  <li><strong>Khi hợp tác:</strong> thông tin cần thiết để lập báo giá, hợp đồng, xuất hóa đơn và bàn giao sản phẩm như tên cá nhân/doanh nghiệp, mã số thuế, địa chỉ, người liên hệ, nội dung và hình ảnh dùng cho website.</li>
</ul>
<h3>3.2. Dữ liệu thu thập tự động (ẩn danh)</h3>
<p><strong>Chỉ khi bạn đồng ý</strong> (qua thông báo cookie hiển thị lần đầu bạn truy cập), để biết trang nào hữu ích và nút liên hệ nào được quan tâm, website ghi lại các sự kiện ẩn danh gồm: đường dẫn trang được xem, loại thiết bị (di động, máy tính bảng, máy tính), tên miền trang giới thiệu (nếu có), các lần bấm vào liên kết gọi điện, Zalo, email, xem demo và mã phiên ngẫu nhiên tồn tại trong tab trình duyệt của bạn. Nếu bạn chọn “Chỉ cần thiết”, không có sự kiện nào được ghi lại. Chúng tôi <strong>không</strong> lưu địa chỉ IP, không dùng cookie quảng cáo, không dùng công cụ theo dõi xuyên trang hay xây dựng hồ sơ hành vi cá nhân của bạn.</p>
<h3>3.3. Dữ liệu kỹ thuật</h3>
<p>Máy chủ và nhà cung cấp hạ tầng có thể ghi nhật ký kỹ thuật (log) theo cơ chế mặc định để vận hành và bảo mật. Địa chỉ IP được dùng tạm thời trong bộ nhớ để giới hạn số lần gửi biểu mẫu, chống thư rác và chống dò mật khẩu, không được lưu để nhận dạng cá nhân.</p>
<h3>3.4. Dữ liệu nhạy cảm</h3>
<p>Chúng tôi không yêu cầu và không có nhu cầu thu thập dữ liệu cá nhân nhạy cảm (sức khỏe, sinh trắc học, tôn giáo, tài khoản ngân hàng, giấy tờ tùy thân…). Vui lòng không gửi các thông tin này qua biểu mẫu hoặc tin nhắn. Nếu cần thanh toán, chúng tôi chỉ cung cấp thông tin tài khoản nhận tiền của mình.</p>

<h2>4. Mục đích sử dụng dữ liệu</h2>
<ul>
  <li>Liên hệ, tư vấn, báo giá và trả lời các yêu cầu bạn gửi đến;</li>
  <li>Ký kết, thực hiện, nghiệm thu, bảo hành và chăm sóc sau bán hàng đối với dịch vụ đã cung cấp;</li>
  <li>Xử lý thanh toán, xuất hóa đơn, thực hiện nghĩa vụ kế toán và thuế theo quy định;</li>
  <li>Thống kê ẩn danh nhằm cải thiện nội dung, giao diện và trải nghiệm trên website;</li>
  <li>Bảo vệ hệ thống, phát hiện và ngăn chặn gian lận, thư rác, truy cập trái phép;</li>
  <li>Tuân thủ yêu cầu hợp pháp của cơ quan nhà nước có thẩm quyền.</li>
</ul>
<p>Chúng tôi không sử dụng dữ liệu của bạn cho mục đích khác nếu chưa được bạn đồng ý, trừ khi pháp luật có quy định khác.</p>

<h2>5. Sự đồng ý của bạn</h2>
<p>Khi bạn tự nguyện gửi biểu mẫu, nhắn tin hoặc ký hợp tác với chúng tôi, bạn đồng ý để chúng tôi xử lý dữ liệu theo Chính sách này. Sự đồng ý được thể hiện bằng hành động rõ ràng của bạn. Bạn có thể rút lại sự đồng ý bất cứ lúc nào bằng cách liên hệ theo mục 14; việc rút lại không ảnh hưởng đến tính hợp pháp của việc xử lý đã thực hiện trước đó.</p>

<h2>6. Chia sẻ dữ liệu với bên thứ ba</h2>
<p>Chúng tôi <strong>không bán</strong> và không cho thuê dữ liệu cá nhân của bạn. Dữ liệu chỉ được chia sẻ trong những trường hợp sau:</p>
<ul>
  <li><strong>Nhà cung cấp hạ tầng và công cụ</strong> giúp chúng tôi vận hành: dịch vụ lưu trữ cơ sở dữ liệu và tệp (Supabase), dịch vụ máy chủ/hosting, dịch vụ tên miền, dịch vụ thông báo nội bộ (Telegram) để đội ngũ nhận thông tin yêu cầu tư vấn kịp thời.</li>
  <li><strong>Nội dung nhúng từ bên thứ ba:</strong> trang Dịch vụ và Bảng giá có khung nhúng của iNET (inet.vn) để bạn tham khảo tên miền, hosting. Khung này <strong>chỉ được tải sau khi bạn cho phép</strong>; khi tải, iNET có thể nhận địa chỉ IP, đặt cookie riêng theo chính sách của họ. Một số trang demo trong kho mẫu có thể tải phông chữ từ Google Fonts. Các bên này không do chúng tôi kiểm soát. Các bên này chỉ được xử lý dữ liệu theo hướng dẫn của chúng tôi và nghĩa vụ bảo mật.</li>
  <li><strong>Nền tảng bạn chủ động sử dụng</strong> như Zalo, Facebook, TikTok, Instagram: khi bạn bấm vào liên kết, việc xử lý dữ liệu do chính nền tảng đó chịu trách nhiệm theo chính sách của họ.</li>
  <li><strong>Cơ quan nhà nước có thẩm quyền</strong> khi có yêu cầu bằng văn bản theo đúng quy định pháp luật.</li>
  <li><strong>Đối tác thực hiện dự án</strong> (nếu có, ví dụ đơn vị cung cấp tên miền, hosting mà bạn đồng ý sử dụng) ở mức tối thiểu cần thiết.</li>
</ul>

<h2>7. Chuyển dữ liệu ra ngoài lãnh thổ Việt Nam</h2>
<p>Một số nhà cung cấp hạ tầng có máy chủ đặt ở nước ngoài. Khi đó, chúng tôi chỉ sử dụng các nhà cung cấp có cam kết bảo mật phù hợp và thực hiện các nghĩa vụ liên quan theo quy định về chuyển dữ liệu cá nhân xuyên biên giới của pháp luật Việt Nam.</p>

<h2>8. Thời gian lưu trữ</h2>
<ul>
  <li><strong>Yêu cầu tư vấn:</strong> lưu tối đa 24 tháng kể từ lần liên hệ cuối cùng, hoặc đến khi bạn yêu cầu xóa, tùy điều kiện nào đến trước;</li>
  <li><strong>Thông tin hợp đồng, thanh toán, hóa đơn:</strong> lưu theo thời hạn mà pháp luật về kế toán, thuế quy định;</li>
  <li><strong>Thống kê ẩn danh:</strong> lưu tối đa 24 tháng, sau đó xóa hoặc chỉ giữ ở dạng tổng hợp;</li>
  <li><strong>Nội dung, hình ảnh của khách hàng:</strong> lưu trong thời gian thực hiện và bảo hành dự án, và được xóa khi bạn yêu cầu sau khi kết thúc hợp tác, trừ phần thuộc sản phẩm đã bàn giao.</li>
</ul>

<h2>9. Biện pháp bảo mật</h2>
<ul>
  <li>Website và trang quản trị vận hành qua kết nối mã hóa HTTPS;</li>
  <li>Cơ sở dữ liệu được bật kiểm soát truy cập theo hàng (Row Level Security); khóa truy cập chỉ lưu ở phía máy chủ, không lộ ra trình duyệt;</li>
  <li>Trang quản trị yêu cầu xác thực, giới hạn số lần đăng nhập sai, phiên đăng nhập có chữ ký và hạn sử dụng;</li>
  <li>Chỉ những người có nhiệm vụ mới được truy cập dữ liệu, và phải giữ bí mật thông tin;</li>
  <li>Biểu mẫu có cơ chế chống thư rác và giới hạn tần suất gửi.</li>
</ul>
<p>Không có hệ thống nào an toàn tuyệt đối. Nếu phát hiện sự cố ảnh hưởng đến dữ liệu cá nhân, chúng tôi sẽ xử lý, khắc phục và thông báo cho cơ quan có thẩm quyền cũng như người bị ảnh hưởng theo đúng thời hạn và quy định của pháp luật (trong đó có yêu cầu thông báo trong vòng 72 giờ kể từ khi phát hiện vi phạm đối với các trường hợp thuộc phạm vi bắt buộc).</p>

<h2>10. Cookie và lưu trữ cục bộ trên trình duyệt</h2>
<table>
  <thead><tr><th>Tên</th><th>Loại</th><th>Mục đích</th><th>Thời hạn</th></tr></thead>
  <tbody>
    <tr><td>sl_consent</td><td>localStorage (cần thiết)</td><td>Ghi nhớ lựa chọn cookie/quyền riêng tư của bạn; không gửi về máy chủ</td><td>12 tháng, sau đó hỏi lại</td></tr>
    <tr><td>sl_v</td><td>sessionStorage (thống kê)</td><td>Mã phiên ngẫu nhiên để đếm số phiên truy cập, không định danh cá nhân. Chỉ tạo khi bạn đồng ý thống kê</td><td>Đến khi đóng tab</td></tr>
    <tr><td>Cookie của iNET</td><td>Cookie bên thứ ba</td><td>Do iNET đặt khi bạn cho phép tải khung nhúng; xem chính sách của iNET</td><td>Theo iNET</td></tr>
    <tr><td>sl_admin</td><td>Cookie bảo mật (httpOnly)</td><td>Chỉ dành cho quản trị viên đã đăng nhập; khách truy cập không nhận cookie này</td><td>Tối đa 7 ngày</td></tr>
  </tbody>
</table>
<p>Website không đặt cookie cho khách truy cập và không dùng cookie quảng cáo hay công cụ theo dõi để quảng cáo. Bạn có thể thay đổi hoặc rút lại lựa chọn bất cứ lúc nào bằng liên kết “Cài đặt cookie” ở chân trang, hoặc xóa dữ liệu lưu trên trình duyệt; website vẫn hoạt động bình thường.</p>

<h2>11. Quyền của bạn đối với dữ liệu cá nhân</h2>
<p>Theo quy định của pháp luật, bạn có các quyền sau đối với dữ liệu cá nhân của mình:</p>
<ul>
  <li>Được biết về hoạt động xử lý dữ liệu của bạn;</li>
  <li>Đồng ý hoặc không đồng ý, hoặc rút lại sự đồng ý cho việc xử lý dữ liệu;</li>
  <li>Xem, chỉnh sửa hoặc yêu cầu chỉnh sửa dữ liệu cá nhân;</li>
  <li>Yêu cầu cung cấp bản sao dữ liệu cá nhân mà chúng tôi đang lưu;</li>
  <li>Yêu cầu xóa dữ liệu, hạn chế xử lý hoặc phản đối việc xử lý dữ liệu;</li>
  <li>Khiếu nại, tố cáo hoặc khởi kiện theo quy định của pháp luật;</li>
  <li>Yêu cầu bồi thường thiệt hại thực tế nếu dữ liệu của bạn bị xử lý trái quy định;</li>
  <li>Tự bảo vệ quyền của mình hoặc yêu cầu cơ quan, tổ chức có thẩm quyền bảo vệ.</li>
</ul>
<p>Để thực hiện quyền, vui lòng gửi yêu cầu qua email <a href="mailto:{{email}}">{{email}}</a> hoặc gọi/nhắn Zalo <a href="tel:{{phoneLink}}">{{phone}}</a>. Chúng tôi có thể cần xác minh danh tính của bạn và sẽ phản hồi trong thời gian sớm nhất, không quá 72 giờ đối với yêu cầu chỉnh sửa, xóa hoặc hạn chế xử lý theo quy định.</p>

<h2>12. Liên kết đến website khác</h2>
<p>Website có thể chứa liên kết đến website hoặc dịch vụ của bên thứ ba (mạng xã hội, Zalo, trang của khách hàng). Chúng tôi không kiểm soát và không chịu trách nhiệm về nội dung hay chính sách bảo mật của các bên đó. Hãy đọc chính sách của họ trước khi cung cấp thông tin.</p>

<h2>13. Người dưới 16 tuổi</h2>
<p>Dịch vụ của chúng tôi hướng đến cá nhân và doanh nghiệp. Chúng tôi không cố ý thu thập dữ liệu của người dưới 16 tuổi nếu không có sự đồng ý của cha, mẹ hoặc người giám hộ. Nếu bạn cho rằng một trẻ em đã cung cấp dữ liệu cho chúng tôi, hãy liên hệ để chúng tôi xóa dữ liệu đó.</p>

<h2>14. Thay đổi Chính sách</h2>
<p>Chúng tôi có thể cập nhật Chính sách này khi dịch vụ hoặc quy định pháp luật thay đổi. Phiên bản mới có hiệu lực kể từ ngày đăng trên website; ngày “Cập nhật lần cuối” ở đầu trang luôn phản ánh phiên bản hiện hành. Với thay đổi quan trọng, chúng tôi sẽ thông báo nổi bật trên website hoặc qua kênh liên hệ bạn đã cung cấp.</p>

<h2>15. Thông tin liên hệ</h2>
<p>Mọi câu hỏi, góp ý hoặc yêu cầu liên quan đến dữ liệu cá nhân, vui lòng liên hệ:</p>
<ul>
  <li><strong>SuperLanding</strong></li>
  <li>Địa chỉ: {{address}}</li>
  <li>Điện thoại / Zalo: <a href="tel:{{phoneLink}}">{{phone}}</a></li>
  <li>Email: <a href="mailto:{{email}}">{{email}}</a></li>
</ul>
`;

const terms = `
<p class="legal-lead">Cảm ơn bạn đã quan tâm đến dịch vụ của SuperLanding. Khi truy cập website, gửi yêu cầu tư vấn hoặc sử dụng dịch vụ thiết kế website, landing page, tối ưu SEO của chúng tôi, bạn đồng ý với các điều khoản dưới đây. Vui lòng đọc kỹ trước khi sử dụng.</p>
<p><em>Cập nhật lần cuối: {{updated}}</em></p>

<h2>1. Chấp nhận điều khoản</h2>
<p>Bằng việc truy cập website hoặc sử dụng dịch vụ, bạn xác nhận đã đọc, hiểu và đồng ý bị ràng buộc bởi Điều khoản dịch vụ này và <a href="/chinh-sach-bao-mat">Chính sách bảo mật</a>. Nếu bạn không đồng ý, vui lòng ngừng sử dụng website và dịch vụ. Nếu bạn đại diện cho một tổ chức, bạn xác nhận mình có thẩm quyền để đồng ý thay mặt tổ chức đó.</p>

<h2>2. Giải thích từ ngữ</h2>
<ul>
  <li><strong>“SuperLanding”, “chúng tôi”</strong>: đơn vị cung cấp dịch vụ thiết kế website, landing page và các dịch vụ liên quan;</li>
  <li><strong>“Khách hàng”, “bạn”</strong>: cá nhân, tổ chức truy cập website hoặc đặt hàng dịch vụ;</li>
  <li><strong>“Dịch vụ”</strong>: các dịch vụ chúng tôi cung cấp như thiết kế website, thiết kế landing page, tối ưu SEO, cấu hình tên miền, hosting, SSL, chỉnh sửa, nâng cấp, bảo trì;</li>
  <li><strong>“Sản phẩm bàn giao”</strong>: website, landing page, mã nguồn và tài liệu được nghiệm thu, bàn giao cho khách hàng;</li>
  <li><strong>“Báo giá/Hợp đồng”</strong>: văn bản, tin nhắn hoặc email xác nhận phạm vi, chi phí, tiến độ giữa hai bên.</li>
</ul>

<h2>3. Dịch vụ cung cấp</h2>
<p>SuperLanding cung cấp các dịch vụ chính gồm: thiết kế website theo yêu cầu, thiết kế landing page bán hàng, thiết kế website theo ngành, tối ưu SEO, cấu hình tên miền – hosting – SSL, chỉnh sửa và nâng cấp giao diện, bảo trì. Phạm vi cụ thể của từng dự án được xác định trong báo giá hoặc hợp đồng. Nội dung giới thiệu trên website (bao gồm bảng giá) mang tính tham khảo và có thể được điều chỉnh mà không cần báo trước.</p>

<h2>4. Tư vấn, báo giá và ký kết</h2>
<ul>
  <li>Việc gửi yêu cầu tư vấn không tạo ra nghĩa vụ mua dịch vụ đối với bạn và không tạo ra cam kết cung cấp dịch vụ đối với chúng tôi;</li>
  <li>Báo giá được lập dựa trên thông tin bạn cung cấp và có thời hạn hiệu lực ghi trong báo giá. Khi phạm vi công việc thay đổi, chi phí và tiến độ sẽ được điều chỉnh tương ứng;</li>
  <li>Hợp đồng hoặc báo giá được hai bên xác nhận bằng văn bản, email hoặc tin nhắn (Zalo) có giá trị ràng buộc theo quy định về giao dịch điện tử.</li>
</ul>

<h2>5. Quy trình triển khai và trách nhiệm của khách hàng</h2>
<p>Quy trình thông thường gồm: tiếp nhận yêu cầu → khảo sát và thống nhất phạm vi → thiết kế giao diện → duyệt thiết kế → lập trình và tối ưu → kiểm thử → nghiệm thu → bàn giao. Để dự án đúng tiến độ, khách hàng cam kết:</p>
<ul>
  <li>Cung cấp đầy đủ, chính xác nội dung, hình ảnh, logo, thông tin doanh nghiệp và các tài liệu cần thiết;</li>
  <li>Phản hồi, góp ý, phê duyệt trong thời hạn hợp lý đã thỏa thuận. Thời gian chờ phản hồi hoặc chờ tài liệu không được tính vào thời gian thực hiện của chúng tôi;</li>
  <li>Chỉ định người đầu mối liên hệ và có thẩm quyền quyết định;</li>
  <li>Bảo mật thông tin đăng nhập được chia sẻ trong quá trình làm việc.</li>
</ul>

<h2>6. Chi phí và thanh toán</h2>
<ul>
  <li>Chi phí, phương thức và các đợt thanh toán được ghi trong báo giá hoặc hợp đồng. Thông thường khách hàng đặt cọc trước khi triển khai và thanh toán phần còn lại khi nghiệm thu hoặc trước khi bàn giao;</li>
  <li>Thanh toán bằng chuyển khoản vào tài khoản do chúng tôi cung cấp trực tiếp. Chúng tôi sẽ không yêu cầu thanh toán vào tài khoản cá nhân lạ hoặc qua liên kết không xác thực; hãy kiểm tra thông tin qua kênh liên hệ chính thức;</li>
  <li>Chi phí tên miền, hosting, chứng chỉ, bản quyền phông chữ/hình ảnh/plugin trả phí, dịch vụ email, quảng cáo là chi phí của bên thứ ba và chỉ được tính khi đã nêu trong báo giá;</li>
  <li>Hạng mục phát sinh ngoài phạm vi phải được hai bên thống nhất trước khi thực hiện;</li>
  <li>Hóa đơn, chứng từ và thuế được thực hiện theo quy định pháp luật; khách hàng cần cung cấp thông tin xuất hóa đơn khi có nhu cầu.</li>
</ul>

<h2>7. Chỉnh sửa và thay đổi phạm vi</h2>
<p>Số vòng chỉnh sửa thiết kế, chỉnh sửa nội dung nằm trong phạm vi gói dịch vụ được nêu trong báo giá. Các yêu cầu làm lại toàn bộ định hướng, thay đổi cấu trúc, bổ sung chức năng hoặc trang mới sau khi đã duyệt thiết kế được xem là thay đổi phạm vi và có thể phát sinh chi phí, thời gian.</p>

<h2>8. Nghiệm thu, bàn giao và bảo hành</h2>
<ul>
  <li>Sau khi hoàn thành, chúng tôi thông báo để khách hàng kiểm tra. Nếu không có phản hồi bằng văn bản trong thời hạn đã thỏa thuận (mặc định 07 ngày làm việc), sản phẩm được xem là đã nghiệm thu, trừ khi có lý do chính đáng;</li>
  <li>Sản phẩm được bàn giao sau khi khách hàng thanh toán đầy đủ các khoản đến hạn;</li>
  <li>Thời gian bảo hành theo từng gói dịch vụ ghi trong báo giá (ví dụ gói Cơ Bản có bảo hành 04 tháng). Bảo hành bao gồm sửa lỗi kỹ thuật phát sinh từ mã nguồn do chúng tôi xây dựng;</li>
  <li>Bảo hành <strong>không</strong> bao gồm: lỗi do khách hàng hoặc bên thứ ba tự chỉnh sửa mã nguồn, thay đổi cấu hình máy chủ, hết hạn tên miền/hosting, bị tấn công do lộ mật khẩu, thay đổi của nền tảng bên thứ ba, hoặc yêu cầu bổ sung chức năng mới.</li>
</ul>

<h2>9. Quyền sở hữu trí tuệ</h2>
<ul>
  <li><strong>Website SuperLanding:</strong> toàn bộ giao diện, mã nguồn, văn bản, hình ảnh, biểu tượng, thương hiệu trên website này thuộc quyền sở hữu của chúng tôi hoặc bên cấp phép. Bạn không được sao chép, phân phối, chỉnh sửa hay khai thác thương mại nếu chưa được đồng ý bằng văn bản;</li>
  <li><strong>Sản phẩm bàn giao:</strong> sau khi thanh toán đầy đủ, khách hàng được quyền sử dụng sản phẩm bàn giao cho hoạt động kinh doanh của mình theo phạm vi thỏa thuận;</li>
  <li><strong>Thành phần của bên thứ ba:</strong> thư viện, phông chữ, hình ảnh, biểu tượng, plugin được sử dụng theo giấy phép của chủ sở hữu tương ứng; khách hàng tuân thủ các giấy phép này;</li>
  <li><strong>Công cụ và mã dùng chung:</strong> các công cụ, thư viện, mẫu mã, quy trình do chúng tôi phát triển và sử dụng lại giữa nhiều dự án vẫn thuộc quyền của chúng tôi;</li>
  <li><strong>Giới thiệu dự án:</strong> trừ khi khách hàng yêu cầu bảo mật bằng văn bản, chúng tôi có quyền giới thiệu dự án đã hoàn thành trong hồ sơ năng lực và trên website của mình.</li>
</ul>

<h2>10. Nội dung do khách hàng cung cấp</h2>
<p>Khách hàng chịu trách nhiệm về tính hợp pháp, chính xác và quyền sử dụng đối với toàn bộ nội dung, hình ảnh, logo, thông tin cung cấp cho chúng tôi và cam kết không vi phạm quyền sở hữu trí tuệ, quyền nhân thân của bất kỳ bên nào. Chúng tôi có quyền từ chối hoặc ngừng thực hiện nếu nội dung vi phạm pháp luật, thuần phong mỹ tục, gây hại cho người khác hoặc trái với quy định của Luật An ninh mạng, bao gồm nội dung lừa đảo, cờ bạc, hàng cấm, thông tin sai sự thật.</p>

<h2>11. Mẫu giao diện và trang demo</h2>
<p>Các mẫu web và trang demo trên website (bất động sản, giáo dục, thực phẩm, dược phẩm, nội thất…) là sản phẩm minh họa năng lực thiết kế. Tên thương hiệu, sản phẩm, số liệu, hình ảnh trong các mẫu này mang tính giả định, không đại diện cho bất kỳ tổ chức hay sản phẩm thực tế nào và không được hiểu là lời chào hàng, tư vấn y tế, pháp lý hay đầu tư. Việc sử dụng mẫu cho dự án thực tế cần được thỏa thuận riêng.</p>

<h2>12. Quy tắc sử dụng website</h2>
<p>Khi sử dụng website, bạn không được:</p>
<ul>
  <li>Cung cấp thông tin giả mạo, mạo danh người khác hoặc gửi biểu mẫu với mục đích spam;</li>
  <li>Tấn công, dò quét, cố ý gây quá tải hay truy cập trái phép vào hệ thống, trang quản trị và dữ liệu;</li>
  <li>Phát tán mã độc, thu thập dữ liệu hàng loạt (scraping) khi chưa được cho phép;</li>
  <li>Sử dụng website vào mục đích vi phạm pháp luật Việt Nam.</li>
</ul>
<p>Chúng tôi có quyền chặn truy cập và xử lý theo quy định pháp luật đối với hành vi vi phạm.</p>

<h2>13. Dịch vụ của bên thứ ba</h2>
<p>Dịch vụ của chúng tôi có thể phụ thuộc vào nhà cung cấp bên thứ ba như tên miền, hosting, CDN, cơ sở dữ liệu, nền tảng quảng cáo, mạng xã hội, Zalo. Chúng tôi không chịu trách nhiệm đối với gián đoạn, thay đổi chính sách, giá hoặc sự cố xuất phát từ các bên này nằm ngoài khả năng kiểm soát hợp lý của chúng tôi, nhưng sẽ hỗ trợ khách hàng khắc phục trong khả năng cho phép.</p>

<h2>14. Bảo mật và dữ liệu cá nhân</h2>
<p>Việc thu thập và xử lý dữ liệu cá nhân được thực hiện theo <a href="/chinh-sach-bao-mat">Chính sách bảo mật</a>. Hai bên cam kết giữ bí mật thông tin kinh doanh, tài liệu và dữ liệu không công khai mà mình biết được trong quá trình hợp tác, trừ trường hợp phải cung cấp theo yêu cầu của cơ quan có thẩm quyền.</p>

<h2>15. Tạm ngừng, chấm dứt và hoàn tiền</h2>
<ul>
  <li>Mỗi bên có thể chấm dứt hợp tác bằng thông báo bằng văn bản (kể cả email hoặc Zalo) nếu bên còn lại vi phạm nghiêm trọng và không khắc phục trong thời hạn hợp lý sau khi được nhắc;</li>
  <li>Khi khách hàng chấm dứt trước khi hoàn thành, chi phí tương ứng khối lượng công việc đã thực hiện được thanh toán; khoản đặt cọc được đối trừ trước, phần còn lại (nếu có) được hoàn trả theo thỏa thuận;</li>
  <li>Sau khi sản phẩm đã được nghiệm thu và bàn giao, chi phí không được hoàn lại, trừ trường hợp pháp luật có quy định khác hoặc hai bên có thỏa thuận riêng;</li>
  <li>Chúng tôi có quyền tạm ngừng cung cấp dịch vụ khi khách hàng chậm thanh toán, chậm cung cấp tài liệu quá thời hạn thỏa thuận hoặc vi phạm điều khoản.</li>
</ul>

<h2>16. Miễn trừ và giới hạn trách nhiệm</h2>
<ul>
  <li>Chúng tôi nỗ lực đảm bảo chất lượng và thông tin chính xác, nhưng website và dịch vụ được cung cấp trên cơ sở “như hiện có”, có thể gián đoạn hoặc sai sót ngoài ý muốn;</li>
  <li>Chúng tôi không cam kết thứ hạng cụ thể trên công cụ tìm kiếm, lượng truy cập, tỷ lệ chuyển đổi hay doanh thu, vì các kết quả này phụ thuộc vào nhiều yếu tố ngoài tầm kiểm soát (thuật toán tìm kiếm, cạnh tranh, ngân sách, nội dung, sản phẩm của khách hàng…);</li>
  <li>Trong phạm vi pháp luật cho phép, tổng trách nhiệm bồi thường của chúng tôi đối với một dự án không vượt quá tổng phí khách hàng đã thanh toán cho dự án đó, và chúng tôi không chịu trách nhiệm đối với thiệt hại gián tiếp, mất lợi nhuận hoặc mất dữ liệu do nguyên nhân ngoài khả năng kiểm soát;</li>
  <li>Điều này không loại trừ những trách nhiệm mà pháp luật không cho phép loại trừ hoặc giới hạn.</li>
</ul>

<h2>17. Sự kiện bất khả kháng</h2>
<p>Mỗi bên không chịu trách nhiệm về việc chậm hoặc không thực hiện nghĩa vụ do sự kiện bất khả kháng như thiên tai, dịch bệnh, hỏa hoạn, chiến tranh, sự cố hạ tầng mạng diện rộng, quyết định của cơ quan nhà nước hoặc sự cố nghiêm trọng của nhà cung cấp hạ tầng. Bên bị ảnh hưởng phải thông báo kịp thời và nỗ lực khắc phục.</p>

<h2>18. Luật áp dụng và giải quyết tranh chấp</h2>
<p>Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Tranh chấp phát sinh trước hết được giải quyết bằng thương lượng, hòa giải trên tinh thần thiện chí. Nếu không đạt được thỏa thuận, mỗi bên có quyền đưa tranh chấp ra Tòa án có thẩm quyền tại Việt Nam để giải quyết theo quy định của pháp luật.</p>

<h2>19. Thay đổi điều khoản</h2>
<p>Chúng tôi có thể sửa đổi Điều khoản dịch vụ theo thời gian. Phiên bản cập nhật có hiệu lực kể từ khi đăng trên website; việc bạn tiếp tục sử dụng website hoặc dịch vụ sau thời điểm đó được hiểu là chấp nhận thay đổi. Đối với dự án đang thực hiện theo hợp đồng riêng, điều khoản trong hợp đồng được ưu tiên áp dụng.</p>

<h2>20. Liên hệ</h2>
<p>Nếu có thắc mắc về Điều khoản dịch vụ, vui lòng liên hệ:</p>
<ul>
  <li><strong>SuperLanding</strong></li>
  <li>Địa chỉ: {{address}}</li>
  <li>Điện thoại / Zalo: <a href="tel:{{phoneLink}}">{{phone}}</a></li>
  <li>Email: <a href="mailto:{{email}}">{{email}}</a></li>
</ul>
`;

export const legalDefaults: LegalDefault[] = [
  {
    slug: "chinh-sach-bao-mat",
    title: "Chính sách bảo mật",
    description: "Chính sách bảo mật của SuperLanding: dữ liệu chúng tôi thu thập, mục đích sử dụng, thời gian lưu trữ, biện pháp bảo vệ và quyền của bạn đối với dữ liệu cá nhân.",
    content: privacy.trim(),
  },
  {
    slug: "dieu-khoan-dich-vu",
    title: "Điều khoản dịch vụ",
    description: "Điều khoản dịch vụ của SuperLanding: phạm vi dịch vụ, thanh toán, nghiệm thu, bảo hành, quyền sở hữu trí tuệ, giới hạn trách nhiệm và giải quyết tranh chấp.",
    content: terms.trim(),
  },
];

export const LEGAL_SLUGS = legalDefaults.map((p) => p.slug);
