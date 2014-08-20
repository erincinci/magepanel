//
//  TDView.h
//  TDAppKit
//
//  Created by Todd Ditchendorf on 10/19/12.
//
//

#import <Cocoa/Cocoa.h>

@interface TDView : NSView
- (void)setNeedsLayout;
- (void)layoutSubviews;
@end
