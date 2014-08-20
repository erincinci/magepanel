//
//  OKView.h
//  OkudaKit
//
//  Created by Todd Ditchendorf on 10/19/12.
//
//

#import <Cocoa/Cocoa.h>

@interface OKView : NSView
- (void)setNeedsLayout;
- (void)layoutSubviews;

@property (nonatomic, retain) NSColor *backgroundColor;
@property (nonatomic, retain) NSColor *nonMainBackgroundColor;
@end
