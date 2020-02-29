<div class="hidden">
  <div class="form-group" id="newVideoTemplate">
    <label for="recipient-name" class="col-form-label">URL video Youtube or ID:</label>
    <input type="text" class="form-control" name="link">
  </div>


  <div class="form-group" id="linkVideoTemplate">
    <label for="recipient-name" class="col-form-label">Link to content:</label>
    <input type="text" class="form-control" name="link" readonly>
    <div class="success" style="display:none;">Link copied to clipboard</div>
  </div>


  <div class="form-group" id="saveToLibTemplate">
    <label for="recipient-text" class="col-form-label">Title video:</label>
    <input type="text" class="form-control" name="title">
    <div>
      <input type="text" class="form-control" placeholder="New playlist" name="playlist-input">
      <div class="dropdown playlist select">
        <button class="btn btn-secondary dropdown-toggle title"  id="navbarEdit" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" id="libList">Default playlist</button>
        <div class="dropdown-menu" aria-labelledby="libList">
          <div class="list">
          </div>
          <div class="dropdown-divider"></div>
            <a class="dropdown-item" data-id="0">Default playlist</a>
            <a class="dropdown-item">+</a>
        </div>
      </div>
    </div>
    <div class="success" style="display:none;">Saved</div>
  </div>

  <div class="form-group" id="videoCaptions">
    <label for="recipient-name" class="col-form-label">Select component:</label>
    <div>
      <select class="component-list select"></select>
      <div class="control">
      </div>
    </div>
    <div class="success" style="display:none;"></div>
  </div>

  <div class="pizzleDialog">
    <label for="recipient-name" class="col-form-label">Select language:</label>
    <div>
      <label for="recipient-name" class="col-form-label">Translate from</label> <select class="component-list" name="lang1"></select> to <select class="component-list" name="lang2"></select>
    </div>
  </div>

  <div class="transDialog">
    <label for="recipient-name" class="col-form-label">Select language:</label>
    <div>
      <label for="recipient-name" class="col-form-label">Translate from</label> <select class="component-list" name="lang1"></select>
    </div>
  </div>

  <div class="descriptionDialog" id="descriptionDialog">
    <label for="description" class="col-form-label" data-locale="description_help"></label>
    <div>
      <textarea name="description"></textarea>
    </div>
  </div>

  <div class="discussionDialog" id="discussionDialog">
    <div class="empty" data-locale="empty_discussion">
    </div>
    <div class="list">
    </div>
    <div class="send-block">
      <textarea name="message" placeholder="Input your message..."></textarea>
    </div>
  </div>

  <div class="discussionItem" id="discussionItem">
    <div class="user">
      <div class="name"></div>
    </div>
    <div class="message">
    </div>
    <div class="childs">
    </div>
  </div>
</div>