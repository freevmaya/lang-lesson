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
    <div class="dropdown mr-1 playlist select">
      <input type="text" class="form-control" placeholder="New playlist" name="playlist-input">
      <button type="button" class="btn btn-secondary dropdown-toggle title" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-offset="10,20">Default playlist</button>
      <div class="dropdown-menu dropdown-menu-right">
        <div class="list">
        </div>
        <div class="dropdown-divider"></div>
          <a class="dropdown-item" data-id="0">Default playlist</a>
          <a class="dropdown-item">+</a>
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
</div>