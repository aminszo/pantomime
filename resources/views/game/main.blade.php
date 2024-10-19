@extends('layout.game-layout')

@section('content')
    <div class="container bg-dark text-light user-select-none">

        <div class="row justify-content-center">
            <div class="col-12 px-0" style="max-width: 440px">

                <div id="game-options-board" class="row min-vh-100 main-page py-5 gx-0 hidden">
                    <div class="col-12 align-self-center">
                        <div class="mb-3">
                            <label for="groups-count-input">تعداد گروه:</label>
                            <input type="number" class="form-control" value="2" id="groups-count-input">
                        </div>
                        <div class="mb-3">
                            <label for="rounds-count-input">تعداد دور:</label>
                            <input type="number" class="form-control" value="2" id="rounds-count-input">
                        </div>
                        <button id="set-game-options-btn" class="btn btn-success big-btn">شروع</button>
                    </div>
                </div>

                <div id="score-board" class="row min-vh-100 main-page py-3 gx-0">
                    <div class="col-12 align-self-start">
                        <p id="winner-indicator" class=""></p>
                    </div>

                    <div class="col-12 align-self-center">
                        <p id="rounds-indicator"></p>
                        <table class="table table-dark">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>گروه</th>
                                    <th>امتیاز</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Group rows will be dynamically inserted here -->
                            </tbody>
                        </table>
                        <button id="start-round-btn" class="btn btn-primary big-btn">بازی</button>
                    </div>

                    <div class="col-12 align-self-end">
                        <hr>
                        <button id="reset-game-btn" class="btn btn-outline-warning big-btn">
                            ریست
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
                    </div>

                    <!-- Modal -->
                    <div class="modal fade" id="rename-group-modal" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content bg-dark">
                                <div class="modal-body">
                                    <input type="text" class="form-control" value="" id="rename-group-input">
                                </div>
                                <div class="modal-footer justify-content-center">
                                    <button id="confirm-rename-btn" type="button"
                                        class="btn btn-primary big-btn">تایید</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="game-board" class="hidden row min-vh-100 main-page py-5 gx-0">
                    <div class="col-12">
                        <p class="mb-5">نوبت <span id="current-group-indicator"></span></p>
                        <span id="word-genre-and-score"></span>
                    </div>

                    <div class="col-12 align-self-center">
                        <div class="p-2 mt-2 mb-5">
                            <!-- Word will be displayed here -->
                            <span id="word-container" class="p-2 border rounded h4"></span>
                        </div>
                    </div>

                    <div class="col-12 align-self-end">
                        <button id="start-timer-btn" class="btn btn-primary big-btn">شروع</button>
                        <button id="change-word-btn" class="btn btn-warning big-btn">تعویض</button>
                        <button id="stop-timer-btn" class="btn btn-warning big-btn hidden">توقف</button>
                        <div id="timer" class="mt-4 mb-2">30</div>
                        <button id="correct-btn" class="btn btn-success big-btn hidden">درست</button>
                        <button id="wrong-btn" class="btn btn-danger big-btn hidden">غلط</button>
                    </div>
                </div>

                <div id="result-screen" class="hidden row min-vh-100 main-page py-5 gx-0">
                    <div class="col-12 align-self-center">
                        <p class="mb-2">امتیاز کلمه : <span id="result-word-score"></span></p>
                        <p class="mb-2">امتیاز زمان : <span id="result-time-score"></span></p>
                        <p class="mb-5">امتیاز منفی تعویض کلمه : <span id="result-word-change-score"></span></p>
                        <p class="mb-3">مجموع : <span id="result-total-score"></span></p>
                        <button class="btn btn-info big-btn continue-btn">ادامه</button>
                    </div>
                </div>

                <div id="rush-board" class="hidden row min-vh-100 main-page py-5 gx-0">
                    <div class="col-12">
                        <p class="mb-5">نوبت <span id="current-group-indicator-rush"></span></p>

                        <span id="word-genre-and-score-rush"></span>
                    </div>

                    <div class="col-12 align-self-center">
                        <div class="p-2 mt-2 mb-5">
                            {{-- Word will be displayed here --}}
                            <span id="word-container-rush" class="p-2 border rounded h4"></span>
                        </div>
                    </div>

                    <div class="col-12 align-self-end">
                        <button id="start-timer-btn-rush" class="btn btn-primary big-btn">شروع</button>

                        <div class="col-12"></div>
                        <button id="next-word-btn" class="btn btn-info big-btn hidden">بعدی</button>
                        <button id="previus-word-btn" class="btn btn-info big-btn hidden">قبلی</button>

                        {{-- <button id="stop-timer-btn" class="btn btn-warning big-btn hidden">توقف</button> --}}
                        <div id="timer-rush" class="my-4"></div>
                        <button id="correct-btn-rush" class="btn btn-success big-btn mb-5 hidden">درست</button>

                        <div></div>
                        <button id="stop-timer-btn-rush" class="btn btn-secondary big-btn mt-5 hidden">توقف</button>
                    </div>
                </div>

                <div id="rush-result-screen" class="hidden row min-vh-100 main-page py-5 gx-0">
                    <div class="col-12 align-self-center">
                        <button class="btn btn-info big-btn continue-btn mb-3">ادامه</button>
                        <p id="total-score-rush" class="mb-5"></p>
                        <div id="correct-words-list"></div>
                    </div>
                </div>

                <div id="selector-board" class="hidden row min-vh-100 main-page py-5 gx-0">
                    <div class="col-12 align-self-center">
                        <div id="score-selector" class="mb-3 hidden">
                            <div id="score-selector-row" class="row row-cols-4 justify-content-center">
                                <div class="col">
                                    <div class="score" data-score="3">3</div>
                                </div>
                                <div class="col">
                                    <div class="score" data-score="2">2</div>
                                </div>
                                <div class="col">
                                    <div class="score" data-score="1">1</div>
                                </div>
                            </div>
                        </div>
                        <div class="row row-cols-3 g-3" id="genre-selector">
                            <div class="col">
                                <div class="genre" data-genre="thing">اشیا</div>
                            </div>
                            <div class="col">
                                <div class="genre" data-genre="animal">حیوان</div>
                            </div>
                            <div class="col">
                                <div class="genre" data-genre="food">غذا</div>
                            </div>
                        </div>

                        <!-- Modal -->
                        <div class="modal fade" id="confirm-round-start" tabindex="-1" aria-labelledby="modal-1-label"
                            aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered">
                                <div class="modal-content bg-dark">
                                    <div class="modal-body" id="confirm-round-start-question">
                                    </div>
                                    <div class="modal-footer justify-content-center">
                                        <button type="button" class="btn btn-secondary big-btn"
                                            data-bs-dismiss="modal">لغو</button>
                                        <button id="confirm-selection-btn" type="button"
                                            class="btn btn-primary big-btn">تایید</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- countdown music -->
                <audio id="countdown-music" src="{{ asset('audio/good_morning_doctor_weird.mp3') }}" loop
                    alt="https://soundimage.org/wp-content/uploads/2016/06/Good-Morning-Doctor-Weird.mp3"></audio>

                <!-- end countdown music -->
                <audio id="end-countdown-music" src="{{ asset('audio/ding_sound.mp3') }}"></audio>

            </div>
        </div>
    </div>
@endsection
