# Wetube Reloaded

유저와 동영상이 이 프로젝트에서 가장 중요한 데이터이다. 즉, 이것들이 이 프로젝트의 도메인이다.

이 도메인을 URL의 차원에서 생각해보자.
이를 바탕으로 URL을 디자인해보자.

/ -> Home
/join -> Join
/login -> Login
/search -> Search

User
/edit-user -> Edit user
/delete-user -> Delete user

Video
/watch-video -> Watch Video
/edit-video -> Edit Video
/delete-video -> Delete Video

==> 우리의 URL들은 뭔가를 수정하거나 프로필을 삭제하거나 하는 행동들을 나타낸다.
==> 위와 같이 하는 것도, 최선의 방법은 라우터를 도메인 별로 나누는 것. -> 유저의 URL을 가져와서 라우터 안에 넣는 것..동영상도..

라우터는 url이 어떻게 시작하는지에 따라 나누는 방법.
우선, 라우터 url이 어떻게 생겼는지 알아보자.

Global
/ -> Home
/join -> Join
/login -> Login
/search -> Search
==> \* 원래 논리대로라면 join과 login은 user 라우터에, search는 video 라우터에 있어야하는데 그렇게 하면 url이 지저분해지고, 마케팅적인 면으로도 좋지 않으니 일부러 이렇게 예외를 만들기도 함.

User
/users/:id -> see user
/users/logout -> log out
/users/edit -> Edit my profile
/users/delete -> Delete my profile

Video
/videos/:id -> See Video
/videos/:id/edit -> Edit Video
/videos/:id/delete -> Delete Video
/videos/upload -> upload video

이제 url의 구분이 있다는 것을 이해했을것이다. 즉, 라우터의 역할은 작업중인 주제를 기반으로 url을 그룹화해준다.

Global은 루트에 아주 가까운 페이지만 가진 라우터다. 두번째는 User라우터. 마지막은 Video라우터다. video 라우터를 예로 들자면, watch, edit..등등을 video 라우터라는 한 라우터에 그룹화할 수 있고, 그 뒤로 url을 추가해 나가도록 해준다.
이는 매우 중요하다. 훨씬 보기 좋고 이해하기 좋다.

라우터를 사용하여 url을 그룹화했어도 url이 복잡하다면 라우터 안에 또 다른 라우터도 만들 수 있다.
